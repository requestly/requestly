#!/usr/bin/env bash

npm i -g web-ext

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

