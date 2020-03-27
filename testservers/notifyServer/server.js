const http = require('http');

const requestListener = function(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    console.log(body);
    res.end('ok');
  });
}

const server = http.createServer(requestListener);
server.listen(8080);
console.log("Starting notify server on 8080");