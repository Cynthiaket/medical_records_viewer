const express = require('express');
const router = express.Router();
const store = require('../lib/store');

// GET all records with assignments (doctor view)
router.get('/records', async (req, res) => {
  const all = await store.getAllRecordsWithAssignments();
  res.json(all);
});

module.exports = router;
