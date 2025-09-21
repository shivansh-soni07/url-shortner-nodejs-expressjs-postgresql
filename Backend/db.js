const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'shortify',
  password: '1234',
  port: 5432,  
});

const connectToPostgres = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    
    
    return client;
  } catch (err) {
    console.error('Error connecting to PostgreSQL', err);
  }
};

module.exports = connectToPostgres;


// POSTGRES DB CONNECTION ESTABLISHMENT 