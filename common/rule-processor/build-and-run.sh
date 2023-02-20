#!/usr/bin/env bash

./build.sh

echo "******* OUTPUT ********"
cd dist
node ruleprocessors.js
cd ..