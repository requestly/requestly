#!/usr/bin/env bash

set -e

# Test if all components have been built successfully
if [ -d "public" ]; then
  echo "Requestly Test Passed: public directory exists!"
  cd public/
else
  echo "Requestly Test Failed: public directory does not exist!"
  exit 1
fi

# Move out of public
cd ..

# Run tests for app
cd app
npm test
cd ..

# Run tests for browser-extension
cd browser-extension
bash test.sh
cd ..
