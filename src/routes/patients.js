const express = require('express');
const router = express.Router();
const store = require('../lib/store');

router.post('/', async (req, res) => {
  const {name, dob} = req.body;
  if (!name || !dob) return res.status(400).json({error: 'name and dob required'});
  const id = `pat-${Date.now()}`;
  const patient = {id, name, dob};
  await store.addPatient(patient);
  res.status(201).json(patient);
});

router.get('/:id', async (req, res) => {
  const patient = await store.getPatientById(req.params.id);
  if (!patient) return res.status(404).json({error: 'not found'});
  const records = await store.getRecordsByPatient(patient.id);
  res.json({patient, records});
});

module.exports = router;
