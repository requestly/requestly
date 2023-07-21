#!/usr/bin/env bash

# Bump up the version
VERSION=`date +'%-y.%-m.%d'`
npm version $VERSION --allow-same-version

# Run tests
npm run build
npm run test

# Prepare builds folder for new releases
rm -rf builds

# Release for Chrome
BROWSER=chrome ENV=prod npm run config
npm run createReleaseBuild

# Release for Edge
BROWSER=edge ENV=prod npm run config
npm run createReleaseBuild

# Release for Firefox
BROWSER=firefox ENV=prod npm run config
npm run build
# ./release-firefox-extension.sh

# Reset config
BROWSER=chrome ENV=local npm run config
