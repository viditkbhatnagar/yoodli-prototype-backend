// server.js — simplified local sign generator
const express = require('express');
const jwt     = require('jsonwebtoken');

const app = express();
const path    = require('path');
const cors    = require('cors');

// ─── Your Duix credentials ──────────────────────────────────────────────
const appId  = '1383575020709744640';
const appKey = 'b7651b3c-bece-4fee-a13d-35ff37610498';
// ────────────────────────────────────────────────────────────────────────


app.use(cors());                      // enable CORS for all routes
/**
 * Generate a JWT “sign” for Duix, valid for 1 hour.
 */
function createSign(appId, appKey, ttlSeconds = 3600) {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign({ appId, iat: now, exp: now + ttlSeconds }, appKey);
}

/**
 * GET /api/duix/sign?conversationId=<ID>
 * Responds with: { sign: <JWT>, conversationId: <ID> }
 */
app.get('/api/duix/sign', (req, res) => {
  const { conversationId } = req.query;
  if (!conversationId) {
    return res.status(400).json({ error: 'conversationId required' });
  }
  const sign = createSign(appId, appKey);
  res.json({ sign, conversationId });
});

// ─── Start server ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});