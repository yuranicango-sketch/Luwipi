#!/bin/sh
set -eu

rm -rf public
mkdir -p public/auth public/assets

cp index.html public/index.html
cp app.html public/app.html
cp admin.html public/admin.html
cp privacidade.html public/privacidade.html
cp termos.html public/termos.html
cp 404.html public/404.html
cp robots.txt public/robots.txt
cp sitemap.xml public/sitemap.xml
cp site.webmanifest public/site.webmanifest
cp auth/callback.html public/auth/callback.html
cp -R assets/. public/assets/

echo "Static frontend prepared in public/"
