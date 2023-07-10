const fs = require("fs");
const archiver = require("archiver");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir;
};

const createZip = (dir, zipFilePath) => {
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver("zip");

  output.on("close", () => {
    const totalBytes = archive.pointer();

    if (totalBytes) {
      console.log(`Generated ${zipFilePath}: ${totalBytes} bytes`);
    }
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.directory(dir, false);
  archive.finalize();
};

module.exports = { ensureDir, createZip };
