const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Get all jobs for a user
router.get('/', auth, (req, res) => {
  db.query('SELECT * FROM jobs WHERE user_id = ?', [req.user.id], (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

// Add a new job
router.post('/', auth, (req, res) => {
  const { company_name, job_title, application_date, feeling, notes } = req.body;
  db.query('INSERT INTO jobs (user_id, company_name, job_title, application_date, feeling, notes) VALUES (?, ?, ?, ?, ?, ?)', [req.user.id, company_name, job_title, application_date, feeling, notes], (error, results) => {
    if (error) throw error;
    res.json({ id: results.insertId, company_name, job_title, application_date, feeling, notes });
  });
});

// Update a job
router.put('/:id', auth, (req, res) => {
  const { company_name, job_title, application_date, feeling, notes } = req.body;
  db.query('UPDATE jobs SET company_name = ?, job_title = ?, application_date = ?, feeling = ?, notes = ? WHERE id = ? AND user_id = ?', [company_name, job_title, application_date, feeling, notes, req.params.id, req.user.id], (error, results) => {
    if (error) throw error;
    res.json({ msg: 'Job updated' });
  });
});

// Delete a job
router.delete('/:id', auth, (req, res) => {
  db.query('DELETE FROM jobs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (error, results) => {
    if (error) throw error;
    res.json({ msg: 'Job deleted' });
  });
});

module.exports = router;
