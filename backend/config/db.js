// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false 
    }
});

pool.query('SELECT NOW()')
    .then(res => console.log('Database connected successfully:', res.rows[0].now))
    .catch(err => console.error('Database connection FAILED:', err.stack));

module.exports = pool;
