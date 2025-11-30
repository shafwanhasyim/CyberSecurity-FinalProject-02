// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json()); 
app.use(cors()); 

// Penggunaan Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 

// Endpoint Test Server
app.get('/', (req, res) => {
  res.send('Vulnerable Backend Server is Running!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});