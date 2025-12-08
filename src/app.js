const express = require('express');
const path = require('path');
const recordsRouter = require('./routes/records');
const patientsRouter = require('./routes/patients');
const assignmentsRouter = require('./routes/assignments');
const doctorsRouter = require('./routes/doctors');
const authRouter = require('./routes/auth');
const documentsRouter = require('./routes/documents');

const app = express();

app.use(express.json());
app.use('/api/records', recordsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);

// Serve static UI
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve a friendly homepage at /
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

app.get('/health', (req, res) => res.json({status: 'ok'}));

module.exports = app;
