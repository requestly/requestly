#!/usr/bin/env bash
# Prerequisites - Node v18.18.0, pnpm v9.15.9

set -e

echo -e "\n\033[1;37m\033[44m***** Installing monorepo dependencies with pnpm *****\033[0m"

# Clean old node_modules if switching from npm
if [ -d "node_modules" ] && [ ! -f "pnpm-lock.yaml" ]; then
    echo "Cleaning old npm node_modules..."
    rm -rf node_modules
fi

# Install all workspace dependencies
pnpm install

echo -e "\n\033[1;37m\033[44m***** Building packages *****\033[0m"
pnpm turbo build --filter="./packages/*"

echo -e "\n\033[1;37m\033[44m***** Requestly install and build complete *****\033[0m"
echo "Run 'pnpm dev' to start development servers"
