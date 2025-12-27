const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'তন্তিকা API is working!' });
});

// Test auth route
app.post('/api/auth/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth test successful',
    data: req.body 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});