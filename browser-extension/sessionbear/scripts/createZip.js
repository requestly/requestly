const fs = require("fs");
const archiver = require("archiver");
const { version } = require("../package.json");
const { env, browser } = require("../../config/dist/config.build.json");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir;
};

const getDate = () => {
  const padForTwoDigits = (n) => (n < 10 ? "0" + n : n);

  const today = new Date();
  const year = today.getFullYear();
  const month = padForTwoDigits(today.getMonth() + 1);
  const date = padForTwoDigits(today.getDate());

  return `${year}-${month}-${date}`;
};

const SOURCE_DIR = "dist";
const BUILD_DIR = ensureDir("builds");
const OUTPUT_DIR = ensureDir(`${BUILD_DIR}/${browser}`);
const ZIP_FILE = `${OUTPUT_DIR}/sessionbear_v${version}_${env}_${getDate()}.zip`;

const output = fs.createWriteStream(ZIP_FILE);
const archive = archiver("zip");

output.on("close", () => {
  const totalBytes = archive.pointer();

  if (totalBytes) {
    console.log(`Generated ${ZIP_FILE}: ${totalBytes} bytes`);
  }
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

archive.directory(SOURCE_DIR, false);

archive.finalize();
