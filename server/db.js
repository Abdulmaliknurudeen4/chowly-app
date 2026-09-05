const { Pool } = require('pg');
require('dotenv').config();

// Check if we are in production (Render) or local development
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  // Use the Render connection string if available, otherwise fallback to local variables
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  
  // Render requires SSL for database connections
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(), 
};