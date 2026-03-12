const express = require('express');
const axios = require('axios');
const { History } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// POST /api/proxy — server-side proxy to bypass CORS
router.post('/', async (req, res) => {
  const { method, url, headers, body } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  const startTime = Date.now();

  try {
    const config = {
      method: (method || 'GET').toLowerCase(),
      url,
      headers: headers || {},
      validateStatus: () => true,
      timeout: 30000,
    };

    if (['post', 'put', 'patch'].includes(config.method) && body) {
      config.data = body;
    }

    const response = await axios(config);
    const duration = Date.now() - startTime;
    const durationStr = `${duration}ms`;

    let responseBody;
    if (typeof response.data === 'object') {
      responseBody = JSON.stringify(response.data, null, 2);
    } else {
      responseBody = String(response.data);
    }

    // Record to history
    try {
      await History.create({
        userId: req.userId,
        method: (method || 'GET').toUpperCase(),
        url,
        status: response.status,
        duration: durationStr,
        responseBody: responseBody.substring(0, 50000),
      });
    } catch (histErr) {
      console.error('History recording error:', histErr);
    }

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      body: responseBody,
      duration: durationStr,
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    const durationStr = `${duration}ms`;

    try {
      await History.create({
        userId: req.userId,
        method: (method || 'GET').toUpperCase(),
        url,
        status: 0,
        duration: durationStr,
        responseBody: `Error: ${err.message}`,
      });
    } catch (histErr) {
      console.error('History recording error:', histErr);
    }

    res.json({
      status: 0,
      statusText: 'Network Error',
      headers: {},
      body: `Error: ${err.message}`,
      duration: durationStr,
    });
  }
});

module.exports = router;
