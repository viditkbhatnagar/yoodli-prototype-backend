// server.js  ─────────────────────────────────────────────────────────
// minimal dependencies:  only “express” ☑
const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

// ───── simple CORS middleware (no extra package) ───────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// built-in body-parser for JSON
app.use(express.json());

// serve the static frontend (index.html, avatar.html, …)
app.use(express.static(path.join(__dirname)));

// ───── API: sign for Duix ───────────────────────────────────────────
app.get('/api/duix/sign', (req, res) => {
  const { conversationId } = req.query;
  if (!conversationId) return res.status(400).json({ error: 'conversationId required' });

  const sign = generateSign(conversationId);   // dummy helper below
  res.json({ sign, conversationId });
});

// ───── API: upload resume + JD (plain JSON) ────────────────────────
app.post('/api/upload', (req, res) => {
  const { conversationId, resumeText, jdText } = req.body;
  if (!conversationId || !resumeText || !jdText) {
    return res.status(400).json({ error: 'conversationId, resumeText and jdText are required' });
  }

  // TODO:  store these texts or push them to your LLM context here …
  res.json({ ok: true, conversationId });
});

// ───── start server ────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () =>
  console.log(`API listening on http://0.0.0.0:${PORT}`)
);

// helper to fake a JWT-like sign — replace with your real logic
function generateSign(conversationId) {
  const APP_ID  = '1383575020709744640';
  const APP_KEY = 'b7651b3c-bece-4fee-a13d-35ff37610498';

  const payload = {
    appId: APP_ID,
    conversationId,
    iat: Math.floor(Date.now()/1000),
    exp: Math.floor(Date.now()/1000) + 3600
  };

  const header = Buffer.from(JSON.stringify({ alg:'HS256', typ:'JWT' })).toString('base64url');
  const body   = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig    = require('crypto')
                   .createHmac('sha256', APP_KEY)
                   .update(`${header}.${body}`)
                   .digest('base64url');

  return `${header}.${body}.${sig}`;
}