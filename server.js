'use strict';

const Hapi = require('Hapi');
const mongojs = require('mongojs');


const server = new Hapi.Server();
server.connection({
  port: 3000
});

server.app.db = mongojs('hapi-rest-mongo', ['books']);

server.register ([
  require('./routes/books')
], (err) => {
  if (err) {
    throw err;
  }

  server.start((err) => {
    console.log('Server running at ', server.info.uri);
  });
});
