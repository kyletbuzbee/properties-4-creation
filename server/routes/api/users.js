const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth'); // We will create this middleware

// User Model
const User = require('../../models/User');

// @route   POST api/users/register
// @desc    Register new user
// @access  Public
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // Simple validation
  if(!name || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  // Check for existing user
  User.findOne({ email })
    .then(user => {
      if(user) return res.status(400).json({ msg: 'User already exists' });

      const newUser = new User({
        name,
        email,
        password
      });

      // Create salt & hash
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          newUser.password = hash;
          newUser.save()
            .then(user => {
              jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: 3600 },
                (err, token) => {
                  if(err) throw err;
                  res.json({
                    token,
                    user: {
                      id: user.id,
                      name: user.name,
                      email: user.email
                    }
                  });
                }
              )
            });
        })
      })
    })
});

// @route   POST api/users/login
// @desc    Login user
// @access  Public
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if(!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  // Check for existing user
  User.findOne({ email })
    .then(user => {
      if(!user) return res.status(400).json({ msg: 'User does not exist' });

      // Validate password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if(!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

          jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
              if(err) throw err;
              res.json({
                token,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email
                }
              });
            }
          )
        })
    })
});

// @route   GET api/users/me
// @desc    Get user data
// @access  Private
router.get('/me', auth, (req, res) => {
  User.findById(req.user.id)
    .select('-password')
    .then(user => res.json(user));
});

// @route   POST api/users/me/saved-properties
// @desc    Save a property
// @access  Private
router.post('/me/saved-properties', auth, (req, res) => {
    User.findById(req.user.id).then(user => {
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const propertyId = req.body.propertyId;
        if (!user.savedProperties.includes(propertyId)) {
            user.savedProperties.push(propertyId);
            user.save().then(user => res.json(user.savedProperties));
        } else {
            res.status(400).json({ msg: 'Property already saved' });
        }
    });
});

// @route   DELETE api/users/me/saved-properties/:propertyId
// @desc    Remove a saved property
// @access  Private
router.delete('/me/saved-properties/:propertyId', auth, (req, res) => {
    User.findById(req.user.id).then(user => {
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.savedProperties = user.savedProperties.filter(
            property => property.toString() !== req.params.propertyId
        );
        user.save().then(user => res.json(user.savedProperties));
    });
});


module.exports = router;
