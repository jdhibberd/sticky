#!/bin/bash
set -e
npx prettier . --write
npx eslint src
npx tsc
node ./build/frontend-const.js
node ./build/routes.js