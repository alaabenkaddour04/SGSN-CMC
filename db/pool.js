const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => console.log('✅ PostgreSQL connecté avec succès'));
pool.on('error', (err) => console.error('❌ Erreur DB:', err));

module.exports = pool;
