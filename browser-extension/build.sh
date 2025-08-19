#!/usr/bin/env bash

echo -e "\n\033[1;37m\033[44m***** Generating Configuration *****\033[0m"
cd config
ENV=$1 npm run build
cd ..

echo -e "\n\033[1;37m\033[44m***** Building analytics vendors *****\033[0m"
cd ../common/analytics-vendors
npm run build
cd ../../browser-extension

echo -e "\n\033[1;37m\033[44m***** Building Common Code *****\033[0m"
cd common
npm run build
cd ..

echo -e "\n\033[1;37m\033[44m***** Building MV3 extension *****\033[0m"
cd mv3
npm run build:current
cd ..

# SessionBear extension is not used anymore so the source code is deprecated and will be removed in the future
# echo -e "\n***** Building SessionBear extension *****"
# cd sessionbear
# npm run build:current
# cd ..
