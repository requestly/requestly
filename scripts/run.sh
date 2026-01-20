#!/usr/bin/bash

app=$1
env=$2

if [[ -z $1 ]]; then
  app="web"
fi

if [[ -z $2 ]]; then
  env="local"
fi

echo -e "\n\033[1;37m\033[44m***** Starting Requestly in $env mode *****\033[0m"

if [[ "$app" == "web" ]]; then
    if [[ "$env" == "emulator" ]]; then
        pnpm dev:emulator --filter=@requestly/web
    else
        pnpm dev --filter=@requestly/web
    fi
elif [[ "$app" == "extension" ]]; then
    cd clients/extension/mv3
    pnpm watch
    cd ../../..
else
    echo "Usage: ./scripts/run.sh [web|extension] [local|emulator]"
    echo "Or use: pnpm dev (starts all), pnpm dev:web, pnpm dev:extension"
fi
