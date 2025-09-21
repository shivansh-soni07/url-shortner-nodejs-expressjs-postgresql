const express=require("express");
const urlschema=require("../models/urlschema");
const fetchUser = require("../middleware/fetchUser");
const router=express.Router();
const shortid=require("shortid")
const { Pool } = require('pg');



const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'shortify',
  password: '1234',
  port: 5432, // Default port for PostgreSQL
});
// Create URL record
const createUserUrl = async (userId, shortId, redirectUrl) => {
  const query = {
    text: 'INSERT INTO urls (user_id, short_id, redirect_url, visit_history) VALUES ($1, $2, $3, $4)',
    values: [userId, shortId, redirectUrl, []],
  };

  try {
    await pool.query(query);
  } catch (err) {
    console.error('Error creating URL record', err);
    throw err;
  }
};

// Find URL record by shortId
const findUrlByShortId = async (shortId) => {
  const query = {
    text: 'SELECT * FROM urls WHERE short_id = $1',
    values: [shortId],
  };

  try {
    const result = await pool.query(query);
    return result.rows[0];
  } catch (err) {
    console.error('Error finding URL record', err);
    throw err;
  }
};

// Find user links
const findUserLinks = async (userId) => {
  const query = {
    text: 'SELECT * FROM urls WHERE user_id = $1',
    values: [userId],
  };

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error('Error fetching user links', err);
    throw err;
  }
};
 

// Express routes
router.post("/createurl", fetchUser, async (req, res) => {
  const body = req.body;
  const shortID = shortid.generate();
  const client = await pool.connect();
  try {
    await createUserUrl(req.user.id, shortID, body.url);
     // Push current time into visit_history JSONB
     const currentTime = new Date().toISOString();
     const updateQuery = {
       text: 'UPDATE urls SET visit_history = visit_history || $1 WHERE short_id = $2',
       values: [JSON.stringify({ timestamp: currentTime }), shortID],
     };
     const updateQuery2 = {
      text: 'UPDATE urls SET count = count + 1 WHERE short_id = $1',
      values: [shortID], // If you have any specific values to be used in the query, you can add them here
    };
    
    await client.query(updateQuery2);
     
     await client.query(updateQuery);
     
    return res.json({ id: shortID });
  } catch (error) {
    console.error('Error creating URL', error);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }finally {
    client.release();
  }
});

// Analytics

router.get("/analytics/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  try {
    const result = await findUrlByShortId(shortId);
    if (result) {
      return res.json({
        totalClicks: result.visit_history.length,
        analytics: result.visit_history,
      });
    } else {
      return res.status(404).json({ message: 'URL record not found' });
    }
  } catch (error) {
    console.error('Error fetching analytics', error);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

router.get("/userlinks", fetchUser, async (req, res) => {
  try {
    const userLinks = await findUserLinks(req.user.id);
    const linksWithClicks = userLinks.map(link => {
      return {
        ...link,
        totalClicks: link.visit_history.length
      };
    });
    return res.json(linksWithClicks);
  } catch (error) {
    console.error('Error fetching user links', error);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});
module.exports = router;