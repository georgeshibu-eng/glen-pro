#!/usr/bin/env bash
set -euo pipefail

if [ -z "${RENDER_WEBHOOK_URL:-}" ]; then
  echo "RENDER_WEBHOOK_URL is not set; skipping Render deploy."
  exit 0
fi

echo "Triggering Render deploy webhook..."
curl -fsSL -X POST "$RENDER_WEBHOOK_URL" >/dev/null

echo "Render deploy webhook triggered."

