const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// serve static client files
app.use(express.static(path.join(__dirname)));

// Duix sign endpoint
app.get('/api/duix/sign', (req, res) => {
  const { conversationId } = req.query;
  if (!conversationId) return res.status(400).json({ error: 'conversationId required' });
  const sign = generateSign({ conversationId });
  res.json({ sign, conversationId });
});

// Upload resume/jd endpoint
app.post('/api/upload', (req, res) => {
  const { conversationId, resumeText, jdText } = req.body;
  if (!conversationId || !resumeText || !jdText) {
    return res.status(400).json({ error: 'conversationId, resumeText and jdText are required' });
  }
  // TODO: store or process these texts as needed
  res.json({ conversationId, resumeText, jdText });
});

const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => console.log(`API listening on http://0.0.0.0:${port}`));

function generateSign({ conversationId }) {
  const appId = '1383575020709744640';
  const appKey = 'b7651b3c-bece-4fee-a13d-35ff37610498';
  const payload = {
    appId,
    conversationId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body   = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = require('crypto').createHmac('sha256', appKey)
    .update(`${header}.${body}`)
    .digest('base64');
  return `${header}.${body}.${signature}`;
}
