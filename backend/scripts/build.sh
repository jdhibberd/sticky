#!/bin/bash
set -e
npx prettier . --write
npx eslint src
npx tsc
cp -r src/views ./dist/views
cp -r src/public ./dist/public