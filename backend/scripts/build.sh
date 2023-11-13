#!/bin/bash
set -e
(cd ../gen && ./scripts/build.sh)
npx prettier . --write
npx eslint src
npx tsc -b
cp -r src/views ./dist/views
cp -r src/public ./dist/public