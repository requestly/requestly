#!/usr/bin/env bash

echo -e "\n***** Generating configuration *****"
cd config
ENV=$1 npm run build
cd ..

echo -e "\n***** Building common code *****"
cd common
npm run build
cd ..

echo -e "\n***** Building MV2 extension *****"
cd mv2
npm run build:current
cd ..

echo -e "\n***** Building MV3 extension *****"
cd mv3
npm run build:current
cd ..
