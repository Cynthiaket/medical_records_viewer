const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'medical'
};

let pool;
async function init() {
  if (!pool) pool = await mysql.createPool(config);
}

function getPool() {
  if (!pool) throw new Error('DB pool not initialized. Call init() first');
  return pool;
}

async function saveDocumentMeta(meta) {
  await init();
  const sql = `INSERT INTO documents (id, patient_id, filename, original_name, mimetype, size, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await pool.execute(sql, [meta.id, meta.patientId, meta.filename, meta.originalName, meta.mimetype, meta.size, meta.uploadedAt]);
}

module.exports = {saveDocumentMeta, init, getPool};
