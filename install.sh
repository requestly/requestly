# Prerequisites - Node v16.15.0

#!/usr/bin/env bash

set -e

rm -rf node_modules
npm install

echo -e "\n***** Installing React app dependencies *****"
# Install dependencies for react app
cd app
rm -rf node_modules
npm install
cd ..

echo -e "\n***** Installing Browser Extension dependencies *****"
# Install dependencies for browser-extension/config
cd browser-extension
bash install.sh
cd ..

echo -e "\n***** Installing rule-processor dependencies *****"
cd common/rule-processor
rm -rf node_modules
npm install
cd ../..

echo -e "\n***** Requestly install complete *****"
