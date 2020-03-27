const http = require('http');

const data = [
  {
    "entityId": "HOST-809213A8C7C4070D",
    "bitness": "64bit",
    "logicalCpuCores": 16,  
  },
  {
    "entityId": "HOST-809313A8C7C4070D",
    "bitness": "64bit",
    "logicalCpuCores": 4,  
  },
  {
    "entityId": "HOST-804213A8C7C4070D",
    "bitness": "64bit",
    "logicalCpuCores": 1,  
  },
];

const requestListener = function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(data));
}

const server = http.createServer(requestListener);
server.listen(8081);
console.log("Starting avgcpu server on 8081");