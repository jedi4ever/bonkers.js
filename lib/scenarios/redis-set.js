'use strict';
var http = require('http');
var redis = require('redis');

var reqOptions = {
};

var client ;

function makeRequest(config, stats, clients) {

    if (!client) {
      client = redis.createClient(config.port , config.host , reqOptions);
    }

    stats.inproc++;
    var id = Math.random().toString(36).slice(2);

    client.on('error', function(error) {
      stats.inproc--;
      stats.errors_resp++;
    });

    /*
    // If a client ends, we remove it from the number of clients
    // and mark it as an ended request
    client.on('end', function(error) {
          if (clients[id]) {
              stats.clients--;
              delete clients[id];
          }
          stats.ended_req++;
    });
    */

    client.set('test', 'ok', function(err, reply) {
      stats.inproc--;
      stats.clients++;
      clients[id] = client;

      if (err) {
            if (clients[id]) {
                stats.clients--;
                delete clients[id];
            }
            stats.errors_resp++;
      } else {
          if (clients[id]) {
              stats.clients--;
              delete clients[id];
          }
          stats.ended_req++;
      }
      //client.end();
    });


}

module.exports = makeRequest;
