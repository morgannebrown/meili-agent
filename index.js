const express = require('express');
const axios = require('axios');
const app = express();

require('dotenv').config();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'changeme';

// Middleware: Check for x-api-key
app.use((req, res, next) => {
  const clientKey = req.headers['x-api-key'];
  if (clientKey !== SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Health check
app.get('/', (req, res) => {
  res.send('🧠 Meili is alive.');
});

// POST /meili-task – Accepts tasks from other agents
app.post('/meili-task', (req, res) => {
  const { taskName, agent, content } = req.body;
  console.log('✅ Task received:', { taskName, agent, content });
  // Optionally: store this in Airtable or log it to a task queue
  res.json({ status: 'Task received' });
});

// POST /dispatch – Sends payload to external service (e.g., Airtable, Zapier)
app.post('/dispatch', async (req, res) => {
  const { destinationUrl, payload } = req.body;

  try {
    const result = await axios.post(destinationUrl, payload, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Dispatched to:', destinationUrl);
    console.log('🌐 Response:', result.data);
    res.json({ status: 'Dispatched', response: result.data });
  } catch (err) {
    const errorDetails = err.response?.data || err.message;
    console.error('❌ Dispatch failed:', errorDetails);
    res.status(500).json({
      error: 'Dispatch failed',
      details: errorDetails
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Meili is running on port ${PORT}`);
});
