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

Slack notifications (GitHub Actions)

- The CI workflow can post build status to Slack. Create an Incoming Webhook in your Slack workspace and add the webhook URL as a repository secret named `SLACK_WEBHOOK_URL`.
- Steps to configure:
	1. In Slack, go to **Settings & administration → Manage apps** and add **Incoming Webhooks**.
 2. Create a new Incoming Webhook for the channel you want, copy the webhook URL.
 3. In your GitHub repo, go to **Settings → Secrets and variables → Actions → New repository secret** and create `SLACK_WEBHOOK_URL` with the webhook value.
 4. The workflow uses `8398a7/action-slack@v3` to send a formatted message after CI runs.

When configured, CI results (success/failure) will be posted to the chosen Slack channel.

Release (versioning & Docker image)

- The repository supports semantic versioning via `npm version`. Use one of these scripts locally to bump the package version and create an annotated Git tag:

```bash
# patch release (increments patch version)
npm run release:patch

# minor/major releases
npm run release:minor
npm run release:major
```

- After running `npm version ...`, push commits and tags to GitHub:

```bash
git push origin main --follow-tags
```

- The release workflow (`.github/workflows/release.yml`) triggers on tags matching `v*.*.*`. When a tag is pushed the workflow will:
	- Build multi-arch Docker images using `docker/build-push-action`.
	- Push images to the Docker registry configured by repository secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, and `DOCKERHUB_REPO` (format: `username/repo`).
	- Create a GitHub Release for the tag.

- To enable Docker image publishing, add the following repository secrets in GitHub:
	- `DOCKERHUB_USERNAME` — your Docker Hub username (or registry username)
	- `DOCKERHUB_TOKEN` — a Docker Hub access token (or password)
	- `DOCKERHUB_REPO` — full image name, e.g. `myuser/medical-records-viewer`

Once those secrets are configured, pushing a tag like `v1.2.3` will produce a Docker image `myuser/medical-records-viewer:v1.2.3` and `:latest` on Docker Hub and create a GitHub Release.
