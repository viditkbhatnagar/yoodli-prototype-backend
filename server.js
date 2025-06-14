// server.js  (minimal, JSON-only version)
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
app.use(cors());
app.use(express.json());                       // ← parse JSON
app.use(express.static(path.join(__dirname))); // serve index / avatar

// ---------- SIGN ENDPOINT ----------
app.get('/api/duix/sign', (req, res) => {
  const { conversationId } = req.query;
  if (!conversationId) return res.status(400).json({ error: 'conversationId required' });
  res.json({ sign: generateSign({ conversationId }), conversationId });
});

// ---------- JSON UPLOAD ENDPOINT ----------
app.post('/api/upload', (req, res) => {
  const { conversationId, resumeText, jdText } = req.body;
  if (!conversationId || !resumeText || !jdText) {
    return res.status(400).json({ error: 'conversationId, resumeText, jdText required' });
  }
  // TODO: store in DB / send to Duix / etc.
  res.json({ ok: true, conversationId });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`API listening on http://0.0.0.0:${PORT}`));

// ---- dummy sign helper (replace with real credentials) ----
function generateSign({ conversationId }) {
  const appId  = '1383575020709744640';
  const appKey = 'b7651b3c-bece-4fee-a13d-35ff37610498';
  const payload = {
    appId, conversationId,
    iat: Math.floor(Date.now()/1000),
    exp: Math.floor(Date.now()/1000)+3600,
  };
  const header = Buffer.from(JSON.stringify({ alg:'HS256',typ:'JWT'})).toString('base64url');
  const body   = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = require('crypto').createHmac('sha256', appKey)
                     .update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}