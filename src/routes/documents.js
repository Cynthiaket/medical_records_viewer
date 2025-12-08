const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const store = require('../lib/store');
const { authMiddleware } = require('../lib/auth');
const db = require('../lib/db');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, {recursive:true});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({storage});

// Upload document (patient only)
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.user || req.user.role !== 'patient') return res.status(403).json({error:'patients only'});
  if (!req.file) return res.status(400).json({error:'file required'});
  const meta = {
    id: `doc-${Date.now()}`,
    patientId: req.user.id,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date().toISOString()
  };
  // try to save to MySQL; fall back to JSON store
  try {
    await db.saveDocumentMeta(meta);
  } catch (e) {
    const state = await store.read();
    state.documents = state.documents || [];
    state.documents.push(meta);
    await store.write(state);
  }
  res.status(201).json(meta);
});

module.exports = router;
