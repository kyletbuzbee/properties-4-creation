const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const rateLimiter = require('../../middleware/rateLimiter');
require('dotenv').config();

// Configuration for Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n') // Handle multiline private key
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// @route   POST api/contact
// @desc    Submit contact form data to Google Sheet
// @access  Public
router.post('/', rateLimiter(5, 1), async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Simple validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ msg: 'Please enter all fields.' });
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const range = 'Contact Submissions!A:D'; // Assuming sheet named "Contact Submissions" and columns A-D for name, email, subject, message

    const values = [[name, email, subject, message, new Date().toISOString()]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values
      }
    });

    res.json({ msg: 'Contact form submitted successfully!' });
  } catch (error) {
    console.error('Error submitting contact form to Google Sheets:', error);
    res.status(500).json({ msg: 'Server error: Could not submit form.' });
  }
});

module.exports = router;
