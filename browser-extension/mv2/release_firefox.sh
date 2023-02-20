#!/usr/bin/env bash

set -e

shopt -s expand_aliases
source $HOME/personal/repo/scripts/alias.sh

cd dist

echo "INFO: Signing Requestly build using Mozilla web-ext sign api"

sign_requestly_build

echo "INFO: Copying Requestly build to app's public folder"

cd web-ext-artifacts
XPI_FILE=`ls | grep \.xpi$`
cp $XPI_FILE ../../builds/firefox/
cp -f $XPI_FILE ../../../../app/public/firefox/builds/requestly-latest.xpi
cd ..
rm -rf web-ext-artifacts

echo "INFO: Setting version in app/public/firefox/updates.json"

cd ../../../app/public/firefox
VERSION=`echo $XPI_FILE | sed 's/.*-\(.*\).xpi/\1/'`
sed -re "s|[0-9]+\.[0-9]+\.[0-9]+|$VERSION|g" updates.json > updates.json.bck && mv -f updates.json.bck updates.json
cd ../../..

echo "INFO: Requestly firefox release process complete."
