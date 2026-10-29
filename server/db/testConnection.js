import pool from '../config/database.js';

try {
  await pool.query('SELECT NOW()');
  console.log('PostgreSQL connection successful');
} catch (error) {
  console.error('PostgreSQL connection failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
