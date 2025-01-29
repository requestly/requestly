#!/usr/bin/env node

// Save this as scripts/tsc-check.js
const path = require("path");

// Get all file arguments passed to the script
const files = process.argv.slice(2);

// Transform paths by removing 'app/' prefix
const transformedFiles = files.map((file) => file.replace(/^app\//, ""));

// Change to app directory
process.chdir("app");

// Spawn tsc-files process
const { spawnSync } = require("child_process");
const result = spawnSync("tsc-files", ["--noEmit", ...transformedFiles], {
  stdio: "inherit",
});

process.exit(result.status);
