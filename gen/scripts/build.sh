#!/bin/bash
set -e
npx prettier . --write
npx eslint src
npx tsc
node ./build/routes.js