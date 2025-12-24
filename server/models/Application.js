const mongoose = require('mongoose');
const Schema = mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ApplicationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  propertyOfInterest: {
    type: String
  },
  message: {
    type: String
  },
  documents: [
    {
      type: String // Store path to uploaded documents
    }
  ],
  date_submitted: {
    type: Date,
    default: Date.now
  }
});

module.exports = Application = mongoose.model('application', ApplicationSchema);