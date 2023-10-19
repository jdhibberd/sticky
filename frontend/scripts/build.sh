#!/bin/bash
set -e
npx prettier . --write
npx tsc --build
npx webpack
rm -r ./build