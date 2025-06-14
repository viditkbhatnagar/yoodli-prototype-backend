// server.js - serve static files for index and avatar
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const APP_ID = '1383575020709764640'; // your appId
const APP_KEY = 'b7651b3c-bece-4fee-a13d-35ff37610498'; // your appKey
const PORT = 3001;

const app = express();
app.use(cors());
app.use(express.json());

// Serve index.html and other static assets from project root