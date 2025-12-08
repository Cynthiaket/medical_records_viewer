# Branching Strategy

We use a Git branching model with the following branches:

- `main` — Protected, contains production-ready code. Releases are cut from this branch.
- `develop` — Integration branch for completed features. CI runs full test-suite here.
- `feature/<name>` — Feature branches created off `develop`. Merge via PR into `develop`.
- `release/<version>` — Optional, for preparing releases from `develop` to `main`.
- `hotfix/<name>` — For urgent fixes to `main`. Merge back into `develop` after applying.

Guidance
- Keep feature branches small and focused.
- Rebase or merge latest `develop` before creating a PR to reduce conflicts.
