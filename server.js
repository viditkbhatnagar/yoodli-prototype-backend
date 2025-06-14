// server.js - serve static files and sign Duix tokens
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const APP_ID  = '1383575020709764640'; // your appId
const APP_KEY = 'b7651b3c-bece-4fee-a13d-35ff37610498'; // your appKey
const PORT    = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

// Serve static assets from this directory (index.html, JS/CSS, etc.)
app.use(express.static(path.resolve(__dirname)));

// Duix sign endpoint
app.get('/api/duix/sign', (req, res) => {
  const { conversationId } = req.query;
  if (!conversationId) {
    return res.status(400).json({ error: 'Missing conversationId' });
  }
  const payload = { appId: APP_ID, conversationId };
  const sign = jwt.sign(payload, APP_KEY, { expiresIn: '15m' });
  res.json({ sign, conversationId });
});

// Fallback to serve index.html for any other route (SPA behavior)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`);
});