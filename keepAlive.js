const http = require("http");
const path = require("path");
const fs = require("fs");

http.createServer((req, res) => {
  const path = req.url;

  if (path === "/tp.html")
    serveFile(res, "tp.html");
  else {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
}).listen(8080);

function serveFile(res, filePath) {
  setContentType(res, filePath);

  const fullPath = path.join(__dirname, filePath);

  const fileStream = fs.createReadStream(fullPath);
  fileStream.on('error', (error) => {
    console.error(`Error reading file: ${filePath}`, error);
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('Internal Server Error');
  });

  fileStream.pipe(res);
}

function setContentType(res, filePath) {
  const fullPath = path.join(__dirname, filePath);
  const ext = path.extname(fullPath).toLowerCase();

  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript'
    // add more content types as needed
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
}