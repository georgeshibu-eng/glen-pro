# CI/CD Pipeline (GitHub Actions)

This folder contains the scripts used by the GitHub Actions workflows.

## Included workflows
- `.github/workflows/ci.yml`: runs on PRs and pushes, installs deps, compiles Python, and smoke-tests the Flask routes.
- `.github/workflows/cd.yml`: optional deployment trigger for Render via webhook (configured with GitHub Secrets).

## Secrets used by CD
- `RENDER_WEBHOOK_URL` (required if you want auto-deploy): Render Web Service webhook URL to trigger a deployment.

