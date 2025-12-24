const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth'); // We will create this middleware
const multer = require('multer'); // For file uploads
const path = require('path');
const fs = require('fs');

// User Model
const User = require('../../models/User');
// Application Model (We will create this)
const Application = require('../../models/Application');

// Setup storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Error: File upload only supports images (jpeg/jpg/png) and documents (pdf/doc/docx)!');
  }
}).array('documents', 5); // Allow up to 5 documents to be uploaded

// @route   POST api/applications
// @desc    Submit a new application with documents
// @access  Public (or Private if login is required to apply)
router.post('/applications', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ msg: err });
    }

    const { name, email, phone, propertyOfInterest, message } = req.body;
    const documents = req.files ? req.files.map(file => file.path) : [];

    // Simple validation
    if (!name || !email || !phone || !propertyOfInterest) {
      // Clean up uploaded files if validation fails
      documents.forEach(docPath => {
        fs.unlink(docPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      });
      return res.status(400).json({ msg: 'Please enter all required fields for the application.' });
    }

    try {
      const newApplication = new Application({
        name,
        email,
        phone,
        propertyOfInterest,
        message,
        documents
      });

      const application = await newApplication.save();
      res.json({ msg: 'Application submitted successfully!', application });
    } catch (dbErr) {
      console.error('Database error during application submission:', dbErr);
      // Clean up uploaded files if DB save fails
      documents.forEach(docPath => {
        fs.unlink(docPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      });
      res.status(500).json({ msg: 'Server error during application submission.' });
    }
  });
});

module.exports = router;
