#!/bin/sh
set -eu

node scripts/reliability-check.mjs
node scripts/pedagogy-check.mjs
node scripts/workspace-pedagogy-check.mjs
node scripts/specialized-pedagogy-check.mjs
node scripts/progress-sync-check.mjs
node scripts/diagnostic-mapping-check.mjs
node scripts/reading-integrity-check.mjs
node scripts/n2-specialized-check.mjs
node scripts/n3-specialized-check.mjs
node scripts/n4-specialized-check.mjs
node scripts/spaced-review-check.mjs
node scripts/abc-accidental-fidelity-check.mjs
node scripts/final-curriculum-check.mjs

if [ "${VERCEL:-0}" = "1" ]; then
  node scripts/prepare-musescore.mjs
fi

rm -rf public
mkdir -p public/auth public/assets

cp index.html public/index.html
cp app.html public/app.html
cp super-paw-paw.html public/super-paw-paw.html
cp paw-paw-notas.html public/paw-paw-notas.html
cp pintar-teclas.html public/pintar-teclas.html
cp atelie-musical.html public/atelie-musical.html
cp admin.html public/admin.html
cp privacidade.html public/privacidade.html
cp termos.html public/termos.html
cp 404.html public/404.html
cp robots.txt public/robots.txt
cp sitemap.xml public/sitemap.xml
cp site.webmanifest public/site.webmanifest
cp auth/callback.html public/auth/callback.html
cp -R assets/. public/assets/
rm -f public/assets/activities/learning-path.js public/assets/activities/learning-path.css

echo "Static frontend prepared in public/"
