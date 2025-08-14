#!/usr/bin/env bash

echo -e "\n\033[1;37m\033[44m***** Installing analytics vendor's dependencies *****\033[0m"
cd ../common/analytics-vendors
rm -rf node_modules
npm install

# Come back to the browser-extension directory
cd ../../browser-extension/

echo -e "\n\033[1;37m\033[44m***** Installing Common Code dependencies *****\033[0m"
cd common
rm -rf node_modules
npm install
cd ..

echo -e "\n\033[1;37m\033[44m***** Installing MV3 dependencies *****\033[0m"
cd mv3
rm -rf node_modules
npm install
cd ..
