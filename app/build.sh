#!/usr/bin/env bash

env=$1
if [[ -z $1 ]]; then
    env="beta"
fi

npm run build

if [[ "$env" == "prod" ]]; then
    sh ./sourcemaps.sh
else
    echo "Skipping sourcemaps for $env"
fi

# rm -rf build/**/*.map
# Removing sourcemap from deploying in prod
find ./build -name "*.map" -type f -delete
cp -r build/* ../public/
