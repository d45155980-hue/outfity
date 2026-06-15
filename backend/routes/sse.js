const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const sse = require('../utils/sseManager');

router.get('/orders', (req, res) => {
  let userId = null;
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;

  const token = queryToken || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id || decoded._id;
    } catch {}
  }

  sse.addClient(res, userId);
});

module.exports = router;
