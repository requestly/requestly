#!/usr/bin/env bash

export GENERATE_SOURCEMAP=false
export CI=false

env=$1
if [[ -z $1 ]]; then
    echo -e "\n\033[1;37m\033[44m***** No environment specified. Continuing with 'local' *****\033[0m"
    env="local"
fi

# Build script for all components
echo -e "\n\033[1;37m\033[44m***** Cleaning public directory *****\033[0m"
rm -r public
mkdir public

echo -e "\n\033[1;37m\033[44m***** Generating Analytics Vendors Dist Files *****\033[0m"
cd common/analytics-vendors/
sh build.sh
cd ../..

echo -e "\n\033[1;37m\033[44m***** Generating Rule Processor Dist Files *****\033[0m"
cd common/rule-processor/
sh build.sh
cd ../..

echo -e "\n\033[1;37m\033[44m***** Generating requestly-core Dist Files *****\033[0m"
npm run build

echo -e "\n\033[1;37m\033[44m***** Building @requestly/shared *****\033[0m"
cd shared
npm run build
cd ..

echo -e "\n\033[1;37m\033[44m***** Building New React App *****\033[0m"
cd app
bash build.sh ${env}
cd ..

echo -e "\n\033[1;37m\033[44m***** Building browser extension *****\033[0m"
cd browser-extension
bash build.sh ${env}
cd ..


echo -e "\n\033[1;37m\033[44m***** Requestly build complete *****\033[0m"
