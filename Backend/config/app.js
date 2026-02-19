const express = require('express');
const cors = require('cors');

const app = express();




app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

module.exports = app;
