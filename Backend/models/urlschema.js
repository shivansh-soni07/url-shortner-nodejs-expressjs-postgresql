// Function to create the 'urls' table in the database
const createUrlTable = async (pool) => {
  // Query to check if the 'urls' table already exists
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_name = 'urls'
    );
  `;
  
  // Query to create the 'urls' table if it doesn't exist
  const createUrlTableQuery = `
    CREATE TABLE urls (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      short_id VARCHAR(255) UNIQUE NOT NULL,
      redirect_url TEXT NOT NULL,
      visit_history JSONB,
      count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const client = await pool.connect();
  try {
    // Check if the 'urls' table exists
    const checkResult = await client.query(checkTableQuery);
    const tableExists = checkResult.rows[0].exists;
    if (!tableExists) {
      // Create the 'urls' table if it doesn't exist
      await client.query(createUrlTableQuery);
      console.log('URL table created successfully');
    } else {
      console.log('URL table already exists');
    }
  } catch (error) {
    console.error('Error creating or checking URL table:', error);
  } finally {
    client.release();
  }
};

module.exports = createUrlTable;
