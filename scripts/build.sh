#!/bin/bash
set -e
rm -r dist
npx prettier . --write
npx tsc
cp -r src/views dist/views
cp -r src/public dist/public