'use strict'

require('dotenv').config()
var app = require('./app');
var debug = require('debug')('caesium:server');
var http = require('http');
const https = require('https');
const fs = require('fs');

let server;
var port = normalizePort(process.env.PORT || '5000');
app.set('port', port);

 // Do we use SSL or not?
 // N.B. See readme how to generate the SSL certificate.
if((process.env.USE_SSL === 'TRUE')){
  const sslOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_FILE),
    cert: fs.readFileSync(process.env.SSL_CERT_FILE)
  };
  server = https.createServer(sslOptions, app);
} else {
  console.warn('--> Server is NOT using SSL encryption, beware that your auth token can be seen by third parties <--');
  server = http.createServer(app);
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
