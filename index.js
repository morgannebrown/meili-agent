const express = require('express');
const axios = require('axios');
const app = express();

require('dotenv').config();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'changeme';

// Middleware: check for secret key in header
app.use((req, res, next) => {
  const clientKey = req.headers['x-api-key'];
  if (clientKey !== SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// POST /meili-task – Receives tasks from agents
app.post('/meili-task', (req, res) => {
  const { taskName, agent, content } = req.body;
  console.log('✅ New task received:', { taskName, agent, content });
  // Here you can add to a queue or store in Airtable
  res.json({ status: 'Task received' });
});

// POST /dispatch – Tries to POST data to a destination
app.post('/dispatch', async (req, res) => {
  const { destinationUrl, payload } = req.body;

  try {
    const result = await axios.post(destinationUrl, payload, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Dispatched:', result.data);
    res.json({ status: 'Dispatched', response: result.data });
  } catch (err) {
    console.error('❌ Dispatch failed:', err.message);
    res.status(500).json({ error: 'Dispatch failed', details: err.message });
  }
});



// Health check route
app.get('/', (req, res) => {
  res.send('🧠 Meili is alive.');
});

app.listen(PORT, () => {
  console.log(`🚀 Meili is running on port ${PORT}`);
});
