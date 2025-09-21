const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const connectToPostgres = require("./db");
const createUrlTable = require("./models/urlschema");
const createUserTable = require("./models/User");
 

const app = express();
const port = 5000;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'shortify',
  password: '1234',
  port: 5432, // Default port for PostgreSQL
});
const client = connectToPostgres();

createUserTable(pool);
createUrlTable(pool);

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/url', require('./routes/urlroute'));

app.get('/', (req, res) => {
  res.send('Hello Shivansh');
});

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM urls WHERE short_id = $1', [shortId]);
    if (result.rows.length > 0) {
      const entry = result.rows[0];
      
      const createdDate = new Date(entry.created_at);
      const timeDifference = new Date() - createdDate;
      const hoursDifference = timeDifference / (1000 * 60 * 60);
      const countT = entry.count;
      if (hoursDifference >= 48) {
        res.send("link is expired");
      } else {
        // Push current time into visit_history JSONB
        const currentTime = new Date().toISOString();
        const updateQuery = {
          text: 'UPDATE urls SET visit_history = jsonb_set(visit_history, $1, $2) WHERE short_id = $3',
          values: [`{${countT}}`, JSON.stringify({ timestamp: currentTime }), shortId ],
        };
        
        
        const updateQuery2 = {
          text: 'UPDATE urls SET count = count + 1 WHERE short_id = $1',
          values: [shortId], // If you have any specific values to be used in the query, you can add them here
        };
     
        await client.query(updateQuery2);
        await client.query(updateQuery);
        
        res.redirect(entry.redirect_url);
      }
    } else {
      res.status(404).send("URL not found");
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send("Internal Server error");
  } finally {
    client.release();
  }
});

 

app.listen(port, () => {
  console.log(`Your app listening on port ${port}`);
});
