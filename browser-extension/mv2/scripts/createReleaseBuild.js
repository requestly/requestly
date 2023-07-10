const { version } = require("../package.json");
const { browser } = require("../../config/dist/config.build.json");
const { createZip, ensureDir } = require("./utils");

const SOURCE_DIR = "dist";
const BUILD_DIR = ensureDir("builds");
const ZIP_FILE = `${BUILD_DIR}/requestly-${browser}-v${version}.zip`;

createZip(SOURCE_DIR, ZIP_FILE);
