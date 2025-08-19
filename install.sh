# Prerequisites - Node v18.18.0

#!/usr/bin/env bash

set -e

rm -rf node_modules
npm install

echo -e "\n\033[1;37m\033[44m***** Installing and Building @requestly/shared module *****\033[0m"
cd ./shared
rm -rf node_modules
sh ./install.sh
cd ..

echo -e "\n\033[1;37m\033[44m***** Installing React app dependencies *****\033[0m"
# Install dependencies for react app
cd app
rm -rf node_modules
npm install
cd ..

echo -e "\n\033[1;37m\033[44m***** Installing Browser Extension dependencies *****\033[0m"
# Install dependencies for browser-extension/config
cd browser-extension
bash install.sh
cd ..

echo -e "\n\033[1;37m\033[44m***** Installing rule-processor dependencies *****\033[0m"
cd common/rule-processor
rm -rf node_modules
npm install
cd ../..

echo -e "\n\033[1;37m\033[44m***** Installing analytics-vendors dependencies *****\033[0m"
cd common/analytics-vendors
rm -rf node_modules
npm install
cd ../..

echo -e "\n\033[1;37m\033[44m***** Requestly install complete *****\033[0m"
