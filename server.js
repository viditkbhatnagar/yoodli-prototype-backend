const express = require('express');
const cors = require('cors');
const multerPkg = require('multer');
const path = require('path');

const upload = multerPkg({ storage: multerPkg.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());

// serve static client files
app.use(express.static(path.join(__dirname)));  // serve index.html, avatar.html, etc.

// --- Duix sign endpoint ---
app.get('/api/duix/sign', (req, res) => {
const { conversationId } = req.query;
if (!conversationId) return res.status(400).json({ error: 'conversationId required' });

// generate sign with your credentials
const sign = generateSign({ conversationId });
res.json({ sign, conversationId });
});

// --- Upload resume/jd endpoint ---
app.post('/api/upload', upload.fields([{ name: 'resume' }, { name: 'jd' }]), (req, res) => {
const { conversationId } = req.body;
const resumeText = req.files.resume[0].buffer.toString('utf8');
const jdText = req.files.jd[0].buffer.toString('utf8');

// TODO: store or process these texts as needed
res.json({ conversationId, resumeText, jdText });
});

const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => console.log(`API listening on http://0.0.0.0:${port}`));

// Helper to generate JWT-like sign (dummy example)
function generateSign({ conversationId }) {
// insert your real appId/appKey here or pull from env
const appId = '1383575020709744640';
const appKey = 'b7651b3c-bece-4fee-a13d-35ff37610498';
const payload = {
appId,
conversationId,
iat: Math.floor(Date.now() / 1000),
exp: Math.floor(Date.now() / 1000) + 60 * 60,
};
// simplistic base64 + hmac (replace with real signing)
const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
const body = Buffer.from(JSON.stringify(payload)).toString('base64');
const signature = require('crypto')
.createHmac('sha256', appKey)
.update(`${header}.${body}`)
.digest('base64');
return `${header}.${body}.${signature}`;
}