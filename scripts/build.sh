#!/usr/bin/env bash

export GENERATE_SOURCEMAP=false
export CI=false

env=$1
if [[ -z $1 ]]; then
    echo -e "\n\033[1;37m\033[44m***** No environment specified. Continuing with 'local' *****\033[0m"
    env="local"
fi

# Monorepo build script using Turbo
echo -e "\n\033[1;37m\033[44m***** Building all packages and clients *****\033[0m"

# Build all packages first (turbo handles dependency order)
echo -e "\n\033[1;37m\033[44m***** Building packages *****\033[0m"
pnpm turbo build --filter="./packages/*"

# Build web app
echo -e "\n\033[1;37m\033[44m***** Building web app *****\033[0m"
cd clients/web
if [[ "$env" == "emulator" ]]; then
    pnpm build:emulator
else
    pnpm build
fi
cd ../..

# Build browser extension
echo -e "\n\033[1;37m\033[44m***** Building browser extension *****\033[0m"
cd clients/extension
bash build.sh ${env}
cd ../..

echo -e "\n\033[1;37m\033[44m***** Requestly build complete *****\033[0m"
