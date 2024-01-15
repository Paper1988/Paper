const http = require("http");

http.createServer(function (req, res) {
	res.write("I'm alive");
	res.end();
}).listen(8080);
console.log(" >>> Server is online!");