#!/usr/bin/env bash

WORKING_DIR=${pwd}
VERSION=`ls builds | grep "requestly-firefox" | sed 's/.*-v\(.*\).xpi/\1/'`

cp -f builds/requestly-firefox-v$VERSION.xpi ../../app/public/firefox/builds/requestly-latest.xpi

echo "INFO: Setting version in app/public/firefox/updates.json"

cd ../../app/public/firefox
sed -re "s|[0-9]+\.[0-9]+\.[0-9]+|$VERSION|g" updates.json > updates.json.bck && mv -f updates.json.bck updates.json
cd $WORKING_DIR

echo "INFO: Requestly firefox release process complete."
