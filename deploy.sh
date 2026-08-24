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

# Sito statico puro: niente Jekyll. Senza questo file GitHub Pages prova
# comunque a processarlo come Jekyll e la build può fallire silenziosamente
# ("Page build failed." senza altro dettaglio) su contenuti che a Jekyll
# non piacciono, anche se prima erano passati.
touch "$DEPLOY/.nojekyll"

# Cache-busting: GitHub Pages serve css/js con max-age=600, quindi dopo un
# deploy i browser continuano a usare i file vecchi per dieci minuti e sembra
# che il fix non sia passato. La marca temporale nel querystring li forza a
# ricaricare subito. Si applica solo alla COPIA deployata: il sorgente resta
# pulito e il diff non cambia a ogni pubblicazione.
STAMP="$(date +%Y%m%d%H%M%S)"
sed -i '' -E "s|(href=\"css/[a-z-]+\.css)(\?v=[0-9]*)?\"|\1?v=${STAMP}\"|g; s|(src=\"js/[a-z-]+\.js)(\?v=[0-9]*)?\"|\1?v=${STAMP}\"|g" "$DEPLOY/index.html"
echo "→ cache-busting v=${STAMP}"

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
