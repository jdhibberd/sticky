#!/bin/bash

# set up dev container for local development

set -e

for i in {frontend,backend,gen,make}; do
  (cd $i && npm install)
done

rm -f .git/hooks/pre-commit
ln -s "../../make/script/pre-commit-hook.sh" .git/hooks/pre-commit