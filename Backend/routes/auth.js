
const { Pool } = require('pg');
const express = require('express');

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');

// const JWT_SECRET="Shivansh07"  
const JWT_SECRET = "Shivansh07"; // Your JWT secret key

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'shortify',
    password: '1234',
    port: 5432, // Default port for PostgreSQL
  });
const router = express.Router();


//CREATE USER -POST
router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be of length 5').isLength({ min: 5 }),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  try {
    const { name, email, password } = req.body;
    const userExistsQuery = 'SELECT * FROM users WHERE email = $1';
    const userExistsValues = [email];
    const client = await pool.connect();
    try {
      const userExistsResult = await client.query(userExistsQuery, userExistsValues);
      if (userExistsResult.rows.length > 0) {
        return res.status(400).json({ success, error: 'Sorry, a user with this email already exists' });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      const createUserQuery = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id';
      const createUserValues = [name, email, secPass];
      const createUserResult = await client.query(createUserQuery, createUserValues);
      const userId = createUserResult.rows[0].id;
      const data = {
        user: {
          id: userId
        }
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server error');
  }
});


// LOGIN - POST
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const findUserQuery = 'SELECT * FROM users WHERE email = $1';
    const findUserValues = [email];
    const client = await pool.connect();
    try {
      const findUserResult = await client.query(findUserQuery, findUserValues);
      const user = findUserResult.rows[0];
      if (!user) {
        return res.status(400).json({ error: 'Please try to login with correct credentials, no user' });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
      }
      const data = {
        user: {
          id: user.id
        }
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server error');
  }
});


// GET USER - POST
router.post('/getUser', fetchUser, async (req, res) => {
  const userId = req.user.id;
  const client = await pool.connect();
  try {
    const findUserQuery = 'SELECT id, name, email FROM users WHERE id = $1';
    const findUserValues = [userId];
    const userResult = await client.query(findUserQuery, findUserValues);
    const user = userResult.rows[0];
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server error');
  } finally {
    client.release();
  }
});

module.exports = router;
