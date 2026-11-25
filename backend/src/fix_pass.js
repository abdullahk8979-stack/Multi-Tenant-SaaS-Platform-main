const { Pool } = require('pg');
require('dotenv').config();

// 1. Load the bcrypt library
let bcrypt;
try { bcrypt = require('bcryptjs'); } catch (e) { bcrypt = require('bcrypt'); }

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

(async () => {
  try {
    const password = process.env.SEED_TENANT_ADMIN_PASSWORD;
    if (!password) {
      throw new Error('Missing required environment variable: SEED_TENANT_ADMIN_PASSWORD');
    }
    const hash = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [hash, 'admin@demo.com']
    );
    client.release();
    console.log('✅ Password updated for admin@demo.com');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
})();