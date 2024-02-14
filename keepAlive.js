const http = require("http");

http.createServer(function (req, res) {
  const path = req.url;

  if (path === "/tp.html")
    serveFile(res, "tp.html");
  else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end();
  }
}).listen(8080);

function serveFile(res, filePath) {
  const fs = require("fs");
  const fileContents = fs.readFileSync(filePath).toString();

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(fileContents);
}

console.log(" >>> Server is online!");