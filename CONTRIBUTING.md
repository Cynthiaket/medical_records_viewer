# Contributing

This repository uses a standard Git workflow and code review process.

Branching & Workflow
- **main**: production-ready, protected.
- **develop**: integration branch for completed features.
- **feature/**: short-lived feature branches off `develop` (e.g. `feature/add-auth`).
- **hotfix/**: patches to `main` for urgent fixes.

Pull Requests
- Create PRs from `feature/*` into `develop` (or `hotfix/*` into `main` for urgent fixes).
- Include a short description, link to issue, and testing steps.
- Require at least one code review approval before merge.

Code review checklist
- Tests added/updated for new behavior
- No secrets or credentials
- Sanity check for error handling and logging

Commit message standards
- Use Conventional Commits style: `type(scope?): subject`
  - Examples: `feat(api): add records endpoint`, `fix(ui): handle empty state`
- Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`.
