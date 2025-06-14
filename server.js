// server.js
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const crypto  = require('crypto');

const APP_ID  = '1383575020709744640';
const APP_KEY = 'b7651b3c-bece-4fee-a13d-35ff37610498';
const PORT    = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// preload your texts once
const resumeText = fs.readFileSync(path.join(__dirname, 'resume.txt'), 'utf8');
const jdText     = fs.readFileSync(path.join(__dirname, 'jd.txt'),    'utf8');

// Duix sign endpoint (unchanged)
app.get('/api/duix/sign', (req, res) => {
  const { conversationId } = req.query;
  if (!conversationId) return res.status(400).json({ error: 'conversationId required' });
  const sign = generateSign({ conversationId });
  res.json({ sign, conversationId });
});

// New: serve your resume + JD
app.get('/api/context', (req, res) => {
  res.json({ resumeText, jdText });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`);
});

function generateSign({ conversationId }) {
  const payload = {
    appId: APP_ID,
    conversationId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body   = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', APP_KEY)
    .update(`${header}.${body}`)
    .digest('base64');
  return `${header}.${body}.${signature}`;
}