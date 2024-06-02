const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
      if (results.length > 0) {
        return res.status(400).json({ msg: 'User already exists' });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], (error, results) => {
          if (error) throw error;
          const payload = { user: { id: results.insertId } };
          jwt.sign(payload, 'your_jwt_secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
          });
        });
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
      if (results.length === 0) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
      const payload = { user: { id: user.id } };
      jwt.sign(payload, 'your_jwt_secret', { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
