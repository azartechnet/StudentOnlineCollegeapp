const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

/* ============================================================
   CORS — Allow local dev + Vercel production
   ============================================================ */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://student-online-collegeapp.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, curl, mobile)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      console.log('❌ CORS blocked origin:', origin);
      console.log('✅ Allowed origins:', allowedOrigins);

      // Still allow — remove this line to strictly enforce
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

/* ============================================================
   HEALTH CHECKS
   ============================================================ */
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Student Test API is running' });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is running',
    endpoints: ['/api/auth', '/api/questions', '/api/tests', '/api/results'],
  });
});

/* ============================================================
   ROUTES
   ============================================================ */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/results', require('./routes/results'));

/* ============================================================
   404 FALLBACK
   ============================================================ */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

/* ============================================================
   GLOBAL ERROR HANDLER
   ============================================================ */
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

/* ============================================================
   MONGODB
   ============================================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

/* ============================================================
   START SERVER
   ============================================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running on port ${PORT}`)
);