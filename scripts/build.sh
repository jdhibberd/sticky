#!/bin/bash
set -e
rm -r dist
npx tsc
npx prettier . --write
cp -r src/views dist/views
cp -r src/public dist/public