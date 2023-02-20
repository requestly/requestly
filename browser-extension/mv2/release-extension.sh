#!/usr/bin/env bash

VERSION=`date +'%-y.%-m.%d'`

npm version $VERSION
npm run build
npm run test

# Chrome
BROWSER=chrome ENV=prod npm run config
npm run release

# Edge
BROWSER=edge ENV=prod npm run config
npm run release

# Firefox
BROWSER=firefox ENV=prod npm run config
npm run build

# Reset config
BROWSER=chrome ENV=local npm run config
