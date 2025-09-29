#!/usr/bin/env bash

# Change to the parent directory (mv3) to run npm commands
cd "$(dirname "$0")/.."

set -e

BROWSER=firefox ENV=prod npm run config
BUILD_MODE='production' npm run build

# shopt -s expand_aliases
# source "$(dirname "$0")/alias.sh"

cd dist

echo "INFO: Signing Requestly build using Mozilla web-ext sign api"

sign_requestly_build

echo "INFO: Copying Requestly build to app's public folder"

cd web-ext-artifacts
XPI_FILE=`ls | grep \.xpi$`
VERSION=`echo $XPI_FILE | sed 's/.*-\(.*\).xpi/\1/'`

cp $XPI_FILE ../../builds/firefox/requestly-firefox-v$VERSION.xpi
rm -rf web-ext-artifacts
cd ../..
cp -f builds/firefox/requestly-firefox-v$VERSION.xpi ../../app/public/firefox/builds/requestly-latest.xpi

echo "INFO: Requestly firefox release build created."

WORKING_DIR=${pwd}

echo "INFO: Setting version in app/public/firefox/updates.json"

cd ../../app/public/firefox
sed -re "s|[0-9]+\.[0-9]+\.[0-9]+|$VERSION|g" updates.json > updates.json.bck && mv -f updates.json.bck updates.json
cd $WORKING_DIR

echo "INFO: Requestly firefox release process complete."
