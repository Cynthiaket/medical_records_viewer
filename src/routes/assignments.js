const express = require('express');
const router = express.Router();
const store = require('../lib/store');

router.post('/', async (req, res) => {
  const {recordId, doctor, medication, notes} = req.body;
  if (!recordId || !doctor || !medication) return res.status(400).json({error: 'recordId, doctor and medication required'});
  const rec = await store.getRecordById(recordId);
  if (!rec) return res.status(404).json({error: 'record not found'});
  const id = `asg-${Date.now()}`;
  const assign = {id, recordId, doctor, medication, notes: notes || '', assignedAt: new Date().toISOString()};
  await store.addAssignment(assign);
  res.status(201).json(assign);
});

module.exports = router;
