#!/usr/bin/env bash

env=$1
if [[ -z $1 ]]; then
    env="beta"
fi

npm run build
# rm -rf build/**/*.map
find ./build -name "*.map" -type f -delete
cp -r build/* ../public/
