# Release Guide - Phase 5

This document provides step-by-step instructions for releasing and deploying the Medical Records Viewer application.

## Overview

The release process includes:
1. **Semantic Versioning** - bumping version in `package.json` and creating Git tags
2. **Docker Image Build** - multi-architecture images (amd64, arm64)
3. **Image Publishing** - push to Docker Hub or private registry
4. **GitHub Release** - automatic release notes and artifact tracking

## Prerequisites

Before performing a release, ensure:

1. **All changes committed** - working directory must be clean
   ```bash
   git status
   ```

2. **Docker Hub credentials configured** (if using Docker Hub):
   - In GitHub repo → Settings → Secrets and variables → Actions
   - Add these repository secrets:
     - `DOCKERHUB_USERNAME` — your Docker Hub username
     - `DOCKERHUB_TOKEN` — Docker Hub access token (create at hub.docker.com/settings/security)
     - `DOCKERHUB_REPO` — full image name (e.g., `myuser/medical-records-viewer`)

3. **CI passing** - run tests locally before tagging
   ```bash
   npm install
   npm test
   ```

## Release Steps

### Step 1: Prepare Release

Ensure all work is committed and tests pass:

```bash
# Check git status
git status

# Run tests
npm test

# Build Docker locally to verify (optional)
docker build -t medical-records-viewer:local .
```

### Step 2: Bump Version

Use one of the npm scripts to increment the version:

```bash
# Patch release (0.1.2 → 0.1.3)
npm run release:patch

# Minor release (0.1.2 → 0.2.0)
npm run release:minor

# Major release (0.1.2 → 1.0.0)
npm run release:major
```

This command will:
- Update `package.json` version
- Create a Git commit with message "chore(release): v0.1.3" (or your version)
- Create an annotated Git tag (e.g., `v0.1.3`)

### Step 3: Push to GitHub

Push the commit and tag to trigger the release workflow:

```bash
git push origin main --follow-tags
```

The `--follow-tags` flag ensures the newly created tag is pushed along with the commit.

### Step 4: Monitor Release Workflow

1. Go to GitHub repo → Actions tab
2. The "Release" workflow will appear and run automatically
3. Workflow steps:
   - **Set up QEMU** - for multi-arch support
   - **Set up Docker Buildx** - for advanced image building
   - **Login to Docker registry** - using your secrets
   - **Extract tag** - parses the Git tag
   - **Build and push Docker image** - builds images for linux/amd64 and linux/arm64, pushes to registry
   - **Create GitHub Release** - creates a release entry on GitHub

4. Once complete, verify:
   - Docker images pushed to your registry (check Docker Hub or your private registry)
   - GitHub Release created (repo → Releases tab)

## Verifying the Release

### Docker Images

Pull and test the released image:

```bash
# From Docker Hub (replace myuser with your username)
docker pull myuser/medical-records-viewer:v0.1.3
docker run -p 3000:3000 myuser/medical-records-viewer:v0.1.3

# Visit http://localhost:3000 to verify
```

### GitHub Release

View the release in GitHub:
1. Go to your repo on GitHub
2. Click Releases tab
3. View the release entry with the tag and date

## Rollback / Undo Release

If something goes wrong, you can undo:

```bash
# Delete the local tag
git tag -d v0.1.3

# Delete the remote tag
git push origin --delete v0.1.3

# Revert package.json version change
git revert <commit-hash>  # or manually edit and commit

# Re-run release:patch after cleanup
npm run release:patch
git push origin main --follow-tags
```

## Example Release Workflow

```bash
# 1. Prepare and verify
git status
npm test

# 2. Bump version (e.g., patch)
npm run release:patch
# Output: v0.1.2 → v0.1.3

# 3. Check what was created
git log --oneline -5
git tag -l

# 4. Push to GitHub
git push origin main --follow-tags

# 5. Monitor GitHub Actions → Release workflow
# Wait for it to complete (typically 2-5 minutes)

# 6. Verify image on Docker Hub
docker pull myuser/medical-records-viewer:v0.1.3

# 7. View GitHub Release
# Open: https://github.com/Cynthiaket/medical_records_viewer/releases/tag/v0.1.3
```

## Troubleshooting

### "Git working directory not clean" error

If `npm run release:patch` fails with this error, you have uncommitted changes:

```bash
# See what's dirty
git status --short

# Option A: Commit the changes
git add -A
git commit -m "chore: pre-release updates"
npm run release:patch
git push origin main --follow-tags

# Option B: Stash and restore later
git stash
npm run release:patch
git push origin main --follow-tags
git stash pop
```

### Release workflow fails in GitHub Actions

Check the workflow logs:
1. Go to Actions tab → Release workflow
2. Click the failed run
3. Expand "Build and push Docker image" or "Create GitHub Release" steps
4. Common issues:
   - `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, or `DOCKERHUB_REPO` secrets not configured
   - Docker Hub access token expired
   - Dockerfile has syntax errors (run `docker build .` locally to test)

### Image not appearing on Docker Hub

1. Verify secrets are correct:
   - Check token is still valid in Docker Hub settings
   - Check repo name format: `username/repo` (not just `repo`)

2. Check workflow logs for curl/push errors

3. Manually push if needed:
   ```bash
   docker build -t myuser/medical-records-viewer:v0.1.3 .
   docker login  # enter credentials
   docker push myuser/medical-records-viewer:v0.1.3
   ```

## Configuration Reference

### GitHub Secrets (Settings → Secrets and variables → Actions)

| Secret | Example | Description |
|--------|---------|-------------|
| `DOCKERHUB_USERNAME` | `myuser` | Docker Hub username |
| `DOCKERHUB_TOKEN` | `dckr_pat_...` | Docker Hub access token |
| `DOCKERHUB_REPO` | `myuser/medical-records-viewer` | Full image name |

### Workflow Files

- `.github/workflows/ci.yml` - runs tests on push/PR
- `.github/workflows/release.yml` - triggers on semver tags (v*.*.*)

### Version Bumping Scripts

In `package.json`:
```json
"release:patch": "npm version patch -m \"chore(release): %s\"",
"release:minor": "npm version minor -m \"chore(release): %s\"",
"release:major": "npm version major -m \"chore(release): %s\""
```

## Next Steps

- Set up monitoring/alerting for production deployments
- Consider adding automatic changelog generation to GitHub Releases
- Add container security scanning (Trivy, Snyk) in the release workflow
- Set up deployment automation (e.g., ArgoCD, Flux, or Helm charts)

