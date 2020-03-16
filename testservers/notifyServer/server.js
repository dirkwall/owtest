const http = require('http');

const requestListener = function(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    res.end('ok');
  });
}

const server = http.createServer(requestListener);
server.listen(8080);
console.log("Listening on 8080");