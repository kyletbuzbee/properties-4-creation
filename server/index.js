
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { csrfProtection } = require('./middleware/csrf');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://unpkg.com https://cdn.jsdelivr.net 'sha256-TiPh3fdQRZCG/RjIQXFP2TtQd5JA4QqG6b1Xr+0i+/8=' 'sha256-FbrkNONlMi5vMW0Avoo8bVk0oPLDW640T7rQCXR+zb0='; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com https://formspree.io; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; media-src 'self'; worker-src 'self'; child-src 'none';"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

// CSRF Protection Middleware (apply to all routes except CSRF endpoint)
app.use((req, res, next) => {
  if (req.path === '/api/csrf') {
    return next(); // Skip CSRF protection for CSRF endpoint
  }
  csrfProtection(req, res, next);
});

// DB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Use Routes
app.use('/api/csrf', require('./routes/api/csrf'));
app.use('/api/csp', require('./routes/api/csp'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/applications', require('./routes/api/applications'));
app.use('/api/contact', require('./routes/api/contact'));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
