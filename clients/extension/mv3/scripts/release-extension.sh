#!/usr/bin/env bash
BROWSER=chrome ENV=local npm run config

echo **Playwright test Started**
npm run test
# Check if the tests failed
if [ $? -ne 0 ]; then
  echo "Playwright tests failed. Aborting release."
  exit 1
fi

# Continue with the rest of your script if tests pass
echo "Playwright tests passed. Continuing..."

VERSION=`date +'%-y.%-m.%d'`

npm version $VERSION

# Chrome
BROWSER=chrome ENV=prod npm run config
BUILD_MODE='production' npm run build && node scripts/createZip

# Edge
BROWSER=edge ENV=prod npm run config
BUILD_MODE='production' npm run build && node scripts/createZip

# Reset config
BROWSER=chrome ENV=local npm run config
