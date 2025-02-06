#!/usr/bin/env bash

env=$1
if [[ -z $1 ]]; then
    env="beta"
fi

npm run build -- --mode=alpha  

cp -r build/* ../public/
