#!/usr/bin/env bash

VERSION=`date +'%-y.%-m.%d'`

npm version $VERSION

# Chrome
BROWSER=chrome ENV=prod npm run config
npm run release

# Reset config
BROWSER=chrome ENV=local npm run config
