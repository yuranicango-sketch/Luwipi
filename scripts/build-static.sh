#!/bin/sh
set -eu
node scripts/simplified-check.mjs
rm -rf public
mkdir -p public/auth public/assets
for file in index.html app.html pintar-teclas.html admin.html privacidade.html termos.html 404.html robots.txt sitemap.xml site.webmanifest; do
  cp "$file" "public/$file"
done
cp auth/callback.html public/auth/callback.html
cp -R assets/. public/assets/
echo "Static frontend prepared in public/"
