const fs = require("fs");
const http = require("http");
const path = require("path");

const port = Number(process.env.PORT || 5181);
const distDir = path.join(__dirname, "dist");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

const sendFile = (res, filePath) => {
  const extension = path.extname(filePath);
  res.writeHead(200, {
    "Content-Type": contentTypes[extension] || "application/octet-stream",
    "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=31536000"
  });
  fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = path.join(distDir, safePath);

  if (requestedPath.startsWith(distDir) && fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
    sendFile(res, requestedPath);
    return;
  }

  sendFile(res, path.join(distDir, "index.html"));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Frontend static server listening on http://127.0.0.1:${port}`);
});
