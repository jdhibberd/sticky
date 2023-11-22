#!/bin/bash
set -e
npx tsc
# QUIRK: for jest to work with typescript and ecmascript modules we need to run 
# it with an experimental node flag
# https://jestjs.io/docs/ecmascript-modules
#
# QUIRK: similarly we need to override the `testMatch` option to ignore the 
# `.d.ts` files generate by tsc
node --experimental-vm-modules node_modules/jest/bin/jest.js dist \
  --testMatch '**/__tests__/**/*.test.[jt]s?(x)'