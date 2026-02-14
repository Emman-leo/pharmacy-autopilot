// Database connection utility for Supabase PostgreSQL
require('dotenv').config();
const postgres = require('postgres');

// Supabase connection configuration with connection pooling
const sql = postgres(process.env.DATABASE_URL, {
  idle_timeout: 20,
  max_lifetime: 60 * 60,
  connection: {
    application_name: 'pharmacy-management-system'
  }
});

// Test database connection
async function testConnection() {
  try {
    const result = await sql`SELECT version()`;
    console.log('✅ Database connected successfully');
    console.log('PostgreSQL version:', result[0].version);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down database connection...');
  await sql.end();
  process.exit(0);
});

module.exports = { sql, testConnection };