#!/usr/bin/env bash

echo -e "\n***** Generating configuration *****"
cd config
ENV=$1 npm run build
cd ..

echo -e "\n***** Building analytics vendors *****"
cd ../common/analytics-vendors
npm run build
cd ../../browser-extension

echo -e "\n***** Building common code *****"
cd common
npm run build
cd ..

echo -e "\n***** Building MV3 extension *****"
cd mv3
npm run build:current
cd ..

echo -e "\n***** Building SessionBear extension *****"
cd sessionbear
#npm run build:current
cd ..
