const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8080;
const TEST_PAGES_DIR = __dirname;

const server = http.createServer((req, res) => {
  let filePath = req.url.split("?")[0];
  if (filePath === "/") filePath = "/test-response.html";

  const fullPath = path.join(TEST_PAGES_DIR, filePath);

  if (!fullPath.startsWith(TEST_PAGES_DIR)) {
    res.writeHead(403);
    res.end("403 Forbidden");
    return;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(fullPath);
    const contentType = ext === ".html" ? "text/html" : "text/plain";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}/`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
