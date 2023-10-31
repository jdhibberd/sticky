#!/bin/bash
set -e
npx prettier . --write
npx eslint src
npx webpack
cat ./src/css/* > ../backend/dist/public/style.css