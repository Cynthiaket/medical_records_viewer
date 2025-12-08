const express = require('express');
const path = require('path');
const router = express.Router();

const store = require('../lib/store');

router.get('/', async (req, res) => {
  const state = await store.read();
  const records = state.records || [];
  if (req.query.embed === 'patient') {
    const patients = state.patients || [];
    const byId = new Map(patients.map(p => [p.id, p]));
    const enriched = records.map(r => ({...r, patient: byId.get(r.patientId) || null}));
    return res.json(enriched);
  }
  res.json(records);
});

router.get('/:id', async (req, res) => {
  const rec = await store.getRecordById(req.params.id);
  if (!rec) return res.status(404).json({error: 'not found'});
  const assignments = await store.getAssignmentsForRecord(rec.id);
  res.json({...rec, assignments});
});

router.post('/', async (req, res) => {
  const {patientId, conditions, lastVisit} = req.body;
  if (!patientId || !conditions) return res.status(400).json({error: 'patientId and conditions required'});
  const id = `rec-${Date.now()}`;
  const record = {id, patientId, conditions, lastVisit: lastVisit || new Date().toISOString().slice(0,10)};
  await store.addRecord(record);
  res.status(201).json(record);
});

module.exports = router;
