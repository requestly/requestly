#! /usr/bin/bash

app=$1
env=$2

if [[ -z $1 ]]; then
  app="web"
fi

if [[ -z $2 ]]; then
  env="local"
fi

if [[ "$env" == "local" ]]; then
    cd firebase/functions
    npm run emulator
    cd ..
    
    cd app
    npm run start-local
    cd ..
else 
    cd app 
    npm start
    cd ..
fi
