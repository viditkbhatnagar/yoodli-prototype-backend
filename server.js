// server.js
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const crypto  = require('crypto');

// Base64URL encode (no padding, URL-safe)
function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const APP_ID  = '1383666241390120960';
const APP_KEY = '7f039d19-1885-4577-9794-28892924bab9';
const PORT    = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

// serve the static client pages
app.use(express.static(path.join(__dirname)));

// preload the text files
const resumeText = fs.readFileSync(path.join(__dirname, 'resume.txt'), 'utf8');
const jdText     = fs.readFileSync(path.join(__dirname, 'jd.txt'),    'utf8');

// Duix JWT sign endpoint
app.get('/api/duix/sign', (req, res) => {
  const { conversationId } = req.query;
  if (!conversationId) {
    return res.status(400).json({ error: 'conversationId required' });
  }
  const sign = generateSign({ conversationId });
  res.json({ sign, conversationId });
});

// New context endpoint
app.get('/api/context', (req, res) => {
  res.json({ resumeText, jdText });
});

app.listen(PORT, '0.0.0.0', () =>
  console.log(`API listening on http://0.0.0.0:${PORT}`)
);

function generateSign({ conversationId }) {
  const payload = {
    appId: APP_ID,
    conversationId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = base64url(JSON.stringify(payload));
  const rawSig = crypto
    .createHmac('sha256', APP_KEY)
    .update(`${header}.${body}`)
    .digest('base64');
  const signature = rawSig.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${header}.${body}.${signature}`;
}