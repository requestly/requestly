#!/usr/bin/env bash

echo -e "\n***** Installing analytics vendor's dependencies *****"
cd ../../common/analytics-vendors
rm -rf node_modules
npm install
cd ../../browser-extension

echo -e "\n***** Installing common code's dependencies *****"
cd common
rm -rf node_modules
npm install
cd ..

echo -e "\n***** Installing MV3 dependencies *****"
cd mv3
rm -rf node_modules
npm install
cd ..

