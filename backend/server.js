const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* Health checks */
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Student Test API is running' });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is running',
    endpoints: ['/api/auth', '/api/questions', '/api/tests', '/api/results']
  });
});

/* Routes */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/results', require('./routes/results'));

/* 404 fallback */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

/* Global error handler */
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

/* MongoDB */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));