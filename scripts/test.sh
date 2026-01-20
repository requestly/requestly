#!/usr/bin/env bash

set -e

echo -e "\n\033[1;37m\033[44m***** Running Requestly Tests *****\033[0m"

# Run all tests using turbo
echo -e "\n\033[1;37m\033[44m***** Running tests for all packages and clients *****\033[0m"
pnpm turbo test

# Run linting
echo -e "\n\033[1;37m\033[44m***** Running linting *****\033[0m"
pnpm turbo lint

# Type checking
echo -e "\n\033[1;37m\033[44m***** Running type checking *****\033[0m"
pnpm turbo type-check

echo -e "\n\033[1;37m\033[44m***** All tests passed! *****\033[0m"
