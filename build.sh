#!/usr/bin/env bash

export GENERATE_SOURCEMAP=false
export CI=false

env=$1
if [[ -z $1 ]]; then
    echo -e "No environment specified. Continuing with 'local'"
    env="local"
fi

# Build script for all components
echo -e "\n***** Cleaning public directory *****"
rm -r public
mkdir public

echo -e "\n***** Generating Rule Processor Dist Files *****"
cd common/rule-processor/
sh build.sh
cd ../..

echo -e "\n***** Building New React App *****"
cd app
bash build.sh ${env}
cd ..

echo -e "\n***** Building browser extension *****"
cd browser-extension
bash build.sh ${env}

echo -e "\n***** Requestly build complete *****"
