// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const APP_ID  = '1383575020709744640';
const APP_KEY = 'b7651b3c-bece-4fee-a13d-35ff37610498';
const PORT    = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

// serve static client files
app.use(express.static(path.join(__dirname)));  // index.html, avatar.html, etc.

// Duix sign endpoint
app.get('/api/duix/sign', (req, res) => {
  const { conversationId } = req.query;
  if (!conversationId) {
    return res.status(400).json({ error: 'conversationId required' });
  }
  const sign = generateSign({ conversationId });
  res.json({ sign });
});

// Upload resume/jd endpoint
app.post('/api/upload', (req, res) => {
  const { conversationId, resumeText, jdText } = req.body;
  if (!conversationId || !resumeText || !jdText) {
    return res
      .status(400)
      .json({ error: 'conversationId, resumeText and jdText are required' });
  }
  // TODO: store or process these texts as needed
  res.json({ conversationId, resumeText, jdText });
});

// start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`);
});

// helper to generate a JWT-style sign
function generateSign({ conversationId }) {
  const header = Buffer
    .from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .toString('base64');
  const payload = Buffer
    .from(JSON.stringify({
      appId: APP_ID,
      conversationId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    }))
    .toString('base64');
  const signature = crypto
    .createHmac('sha256', APP_KEY)
    .update(`${header}.${payload}`)
    .digest('base64');
  return `${header}.${payload}.${signature}`;
}