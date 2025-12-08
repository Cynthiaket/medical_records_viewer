const express = require('express');
const router = express.Router();
const { sign } = require('../lib/auth');
const store = require('../lib/store');

// Demo login: patients login with patientId; doctors login with doctor name.
router.post('/login', async (req, res) => {
  const { role, id, doctor } = req.body;
    // demo login: accept patient login by {name, dob} or doctor login by {doctor}
    if (role === 'patient') {
      const { name, dob } = req.body;
      if (!name || !dob) return res.status(400).json({ error: 'name and dob required' });
      let patient = await store.getPatientByNameDob(name, dob);
      if (!patient) return res.status(404).json({ error: 'Patient not found' });
      const token = sign({ sub: patient.id, role: 'patient', name: patient.name });
      const out = Object.assign({}, patient, { role: 'patient' });
      return res.json({ token, patient: out });
  }
  if (role === 'doctor') {
      if (!doctor) return res.status(400).json({ error: 'doctor name required' });
    // In demo we don't have doctor records; return token with name
      const token = sign({ sub: doctor, role: 'doctor', name: doctor });
      return res.json({ token, doctor: { id: doctor, name: doctor, role: 'doctor' } });
  }
  res.status(400).json({error:'role must be patient or doctor'});
});

module.exports = router;
