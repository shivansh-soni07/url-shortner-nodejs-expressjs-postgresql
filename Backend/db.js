const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'url-short',
  password: '0000',
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