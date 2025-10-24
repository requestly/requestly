#!/usr/bin/env bash

set -e

# Test if all components have been built successfully
if [ -d "public" ]; then
  echo -e "\n\033[1;37m\033[44m***** Requestly Test Passed: public directory exists! *****\033[0m"
  cd public/
else
  echo -e "\n\033[1;37m\033[44m***** Requestly Test Failed: public directory does not exist! *****\033[0m"
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
