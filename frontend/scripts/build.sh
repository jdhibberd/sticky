#!/bin/bash
set -e
npx prettier . --write
npx tsc
npx webpack
rm -r ./build