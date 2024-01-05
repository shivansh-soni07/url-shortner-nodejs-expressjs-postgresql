// Function to create the user table in the database
const createUserTable = async (pool) => {
  // Query to check if the users table already exists
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_name = 'users'
    );
  `;
  // Query to create the users table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Get a client from the connection pool
  const client = await pool.connect();
  try {
    // Check if the users table exists
    const checkResult = await client.query(checkTableQuery);
    const tableExists = checkResult.rows[0].exists;
    if (!tableExists) {
      // Create the users table if it doesn't exist
      await client.query(createTableQuery);
      console.log('User table created successfully');
    } else {
      console.log('User table already exists');
    }
  } catch (error) {
    console.error('Error creating or checking user table:', error);
  } finally {
    // Release the client back to the pool
    client.release();
  }
};

module.exports = createUserTable;
