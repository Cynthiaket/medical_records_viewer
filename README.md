# Medical Records Viewer

Simple Node.js/Express application that provides a minimal "Medical Records Viewer" web UI and API.

Quick start

1. Install dependencies

```bash
npm ci
```

2. Run locally

```bash
npm start
# Open http://localhost:3000
```

3. Run tests

```bash
npx jest --runInBand
```

Docker

```bash
docker build -t medical-records-viewer:latest .
docker run -p 3000:3000 medical-records-viewer:latest
```

Auth & Uploads (demo)

- Patient login: `public/login_patient.html` — enter a `patientId` from `src/data/store_clean.json` and click Login. A JWT is saved to `localStorage`.
- Doctor login: `public/login_doctor.html` — enter a doctor name.
- Upload: `public/upload.html` — login as patient then upload a document. Metadata is stored to MySQL if configured (see `src/lib/db.js`) or falls back to the JSON store.

Database

- Migration to create documents table: `migrations/create_documents.sql`.
- Configure DB with env vars: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`.

DevOps / Monitoring

- Add logs for uploads and authentication in production.
- Use a monitoring stack (Prometheus + Grafana) and a log aggregator (ELK or Loki) for metrics and logs.
