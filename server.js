// server.js - modified to handle resume/jd upload
// multer for handling file uploads
const multer = require('multer');
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB max
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const APP_ID  = '1383575020709744640';
const APP_KEY = 'b7651b3c-bece-4fee-a13d-35ff37610498';
const PORT    = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

// static files
app.use(express.static(path.resolve(__dirname)));

// multer setup for parsing multipart/form-data
//const upload = multer();

// upload endpoint for resume and job description
app.post(
  '/api/upload',
  upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'jd', maxCount: 1 }]),
  (req, res) => {
    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ error: 'Missing conversationId' });
    }
    const resumeFile = req.files?.resume?.[0];
    const jdFile     = req.files?.jd?.[0];
    if (!resumeFile || !jdFile) {
      return res.status(400).json({ error: 'Both resume and JD files are required' });
    }
    // Simple text extraction for .txt/.md files
    const resumeText = resumeFile.buffer.toString('utf8');
    const jdText     = jdFile.buffer.toString('utf8');
    res.json({ resumeText, jdText });
  }
);

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

// serve SPA
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`);
});