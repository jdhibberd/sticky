#!/bin/bash
# passing the .env vars to the server as a node argument avoids having to import
# the module purely for its side effects, which can be confusing
node -r dotenv/config ./dist/src/main.js