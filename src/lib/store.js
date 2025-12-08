const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');
const db = require('./db');

const STORE_PATH = path.join(__dirname, '..', 'data', 'store_clean.json');

const useMysql = !!(process.env.DB_HOST || process.env.MYSQL_URL || process.env.USE_MYSQL === '1');

async function initJson() {
  try {
    await fs.access(STORE_PATH);
  } catch (e) {
    const initial = { patients: [], records: [], assignments: [] };
    await fs.writeFile(STORE_PATH, JSON.stringify(initial, null, 2));
  }
}

async function read() {
  if (!useMysql) {
    await initJson();
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw);
  }
  // for MySQL mode, build an in-memory snapshot from DB
  await db.init();
  const pool = db.getPool();
  const [patients] = await pool.query('SELECT id, name, DATE_FORMAT(dob, "%Y-%m-%d") as dob FROM patients');
  const [records] = await pool.query('SELECT id, patient_id as patientId, conditions, DATE_FORMAT(last_visit, "%Y-%m-%d") as lastVisit, DATE_FORMAT(created_at, "%Y-%m-%d") as createdAt FROM records');
  const [assignments] = await pool.query('SELECT id, record_id as recordId, medication, note, DATE_FORMAT(assigned_at, "%Y-%m-%d %H:%i:%s") as assignedAt FROM assignments');
  // parse JSON conditions
  const parsedRecords = records.map(r => (Object.assign({}, r, { conditions: r.conditions ? JSON.parse(r.conditions) : [] })));
  return { patients, records: parsedRecords, assignments };
}

async function write(state) {
  if (!useMysql) return fs.writeFile(STORE_PATH, JSON.stringify(state, null, 2));
  throw new Error('write to MySQL is not supported via write(); use specific add functions');
}

// JSON fallback implementations
async function addPatientJson(patient) {
  const state = await read();
  state.patients.push(patient);
  await write(state);
  return patient;
}

async function addRecordJson(record) {
  const state = await read();
  state.records.push(record);
  await write(state);
  return record;
}

async function addAssignmentJson(assign) {
  const state = await read();
  state.assignments.push(assign);
  await write(state);
  return assign;
}

// MySQL implementations
async function addPatientMysql(patient) {
  await db.init();
  const pool = db.getPool();
  const sql = 'INSERT INTO patients (id, name, dob) VALUES (?, ?, ?)';
  await pool.execute(sql, [patient.id, patient.name, patient.dob]);
  return patient;
}

async function addRecordMysql(record) {
  await db.init();
  const pool = db.getPool();
  const sql = 'INSERT INTO records (id, patient_id, conditions, last_visit) VALUES (?, ?, ?, ?)';
  const cond = Array.isArray(record.conditions) ? JSON.stringify(record.conditions) : JSON.stringify([]);
  await pool.execute(sql, [record.id, record.patientId, cond, record.lastVisit || null]);
  return record;
}

async function addAssignmentMysql(assign) {
  await db.init();
  const pool = db.getPool();
  const sql = 'INSERT INTO assignments (id, record_id, medication, note) VALUES (?, ?, ?, ?)';
  await pool.execute(sql, [assign.id, assign.recordId, assign.medication || null, assign.note || null]);
  return assign;
}

async function getPatientById(id) {
  if (!useMysql) {
    const state = await read();
    return state.patients.find(p => p.id === id);
  }
  await db.init();
  const pool = db.getPool();
  const [rows] = await pool.execute('SELECT id, name, DATE_FORMAT(dob, "%Y-%m-%d") as dob FROM patients WHERE id = ?', [id]);
  return rows[0] || null;
}

async function getPatientByNameDob(name, dob) {
  if (!useMysql) {
    const state = await read();
    return state.patients.find(p => p.name === name && p.dob === dob);
  }
  await db.init();
  const pool = db.getPool();
  const [rows] = await pool.execute('SELECT id, name, DATE_FORMAT(dob, "%Y-%m-%d") as dob FROM patients WHERE name = ? AND dob = ?', [name, dob]);
  return rows[0] || null;
}

async function getRecordsByPatient(patientId) {
  if (!useMysql) {
    const state = await read();
    return state.records.filter(r => r.patientId === patientId);
  }
  await db.init();
  const pool = db.getPool();
  const [rows] = await pool.execute('SELECT id, patient_id as patientId, conditions, DATE_FORMAT(last_visit, "%Y-%m-%d") as lastVisit FROM records WHERE patient_id = ?', [patientId]);
  return rows.map(r => ({ ...r, conditions: r.conditions ? JSON.parse(r.conditions) : [] }));
}

async function getRecordById(id) {
  if (!useMysql) {
    const state = await read();
    return state.records.find(r => r.id === id);
  }
  await db.init();
  const pool = db.getPool();
  const [rows] = await pool.execute('SELECT id, patient_id as patientId, conditions, DATE_FORMAT(last_visit, "%Y-%m-%d") as lastVisit FROM records WHERE id = ?', [id]);
  if (!rows[0]) return null;
  const r = rows[0];
  r.conditions = r.conditions ? JSON.parse(r.conditions) : [];
  return r;
}

async function getAssignmentsForRecord(recordId) {
  if (!useMysql) {
    const state = await read();
    return state.assignments.filter(a => a.recordId === recordId);
  }
  await db.init();
  const pool = db.getPool();
  const [rows] = await pool.execute('SELECT id, record_id as recordId, medication, note, DATE_FORMAT(assigned_at, "%Y-%m-%d %H:%i:%s") as assignedAt FROM assignments WHERE record_id = ?', [recordId]);
  return rows;
}

async function getAllRecordsWithAssignments() {
  if (!useMysql) {
    const state = await read();
    return state.records.map(r => ({
      ...r,
      patient: state.patients.find(p => p.id === r.patientId) || null,
      assignments: state.assignments.filter(a => a.recordId === r.id)
    }));
  }
  // MySQL: join records + patients + assignments
  await db.init();
  const pool = db.getPool();
  const [records] = await pool.query('SELECT r.id, r.patient_id as patientId, r.conditions, DATE_FORMAT(r.last_visit, "%Y-%m-%d") as lastVisit, p.name as patientName, DATE_FORMAT(p.dob, "%Y-%m-%d") as patientDob FROM records r JOIN patients p ON p.id = r.patient_id');
  // fetch assignments grouped by record
  const [assignments] = await pool.query('SELECT id, record_id as recordId, medication, note, DATE_FORMAT(assigned_at, "%Y-%m-%d %H:%i:%s") as assignedAt FROM assignments');
  const byRecord = {};
  for (const a of assignments) {
    (byRecord[a.recordId] = byRecord[a.recordId] || []).push(a);
  }
  return records.map(r => ({ id: r.id, patientId: r.patientId, conditions: r.conditions ? JSON.parse(r.conditions) : [], lastVisit: r.lastVisit, patient: { id: r.patientId, name: r.patientName, dob: r.patientDob }, assignments: byRecord[r.id] || [] }));
}

module.exports = {
  init: initJson,
  read,
  write,
  addPatient: useMysql ? addPatientMysql : addPatientJson,
  addRecord: useMysql ? addRecordMysql : addRecordJson,
  addAssignment: useMysql ? addAssignmentMysql : addAssignmentJson,
  getPatientById,
  getPatientByNameDob,
  getRecordById,
  getRecordsByPatient,
  getAssignmentsForRecord,
  getAllRecordsWithAssignments
};
