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
VERSION=`echo $XPI_FILE | sed 's/.*-\(.*\).xpi/\1/'`

cp $XPI_FILE ../../builds/requestly-firefox-v$VERSION.xpi
rm -rf web-ext-artifacts
cd ../..

./publish-firefox-extension.sh

echo "INFO: Requestly firefox release process complete."
