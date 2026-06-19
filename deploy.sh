#!/bin/bash
# Push public/ to GitHub Pages (org site → clean URL)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
DEPLOY="/tmp/nineteen-milano-guest-deploy"
ORG="nineteen-milano"
REPO="${ORG}/${ORG}.github.io"
REPO_URL="https://github.com/${REPO}.git"
URL="https://${ORG}.github.io/"

if ! gh api "orgs/${ORG}" &>/dev/null; then
  echo "❌ Organizzazione GitHub «${ORG}» non trovata."
  echo ""
  echo "Crea l'org (Free, 2 min):"
  echo "  → https://github.com/organizations/plan"
  echo ""
  echo "  Nome org: ${ORG}"
  echo "  Piano: Free"
  echo "  Poi rilancia: ./deploy.sh"
  exit 1
fi

if ! gh repo view "${REPO}" &>/dev/null; then
  echo "→ Creo repo ${REPO}…"
  gh repo create "${REPO}" --public --description "Nineteen Milano — guest guide"
fi

rm -rf "$DEPLOY"
mkdir -p "$DEPLOY"
cp -R "$ROOT/public/." "$DEPLOY/"
find "$DEPLOY" -name '.DS_Store' -delete

cd "$DEPLOY"
git init -b main
git add .
git commit -m "Update guest portal $(date +%Y-%m-%d)"
git remote add origin "$REPO_URL"
git push -f origin main

echo ""
echo "✓ Deployed → ${URL}"
echo "  (GitHub Pages: Settings → Pages → branch main, folder / — di solito si attiva da solo)"
echo "  Attendi 1–2 minuti al primo deploy."
