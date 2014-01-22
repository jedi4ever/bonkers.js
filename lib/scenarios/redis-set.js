'use strict';

var redis = require('redis');

// By default redis will keep trying to reconnect
var redisOptions = {
  //socket_nodelay: true, // this is default , is ok
  enable_offline_queue: false, // we don't queue request if redis is down
  retry_max_delay: 200, // normally delay doubles after each try (default = null)
  //connect_timeout: false, // normally client will retry, but we can set it to a specific time(ms)
  //max_attempts: null , // we can give up after X tries, but in our case we keep going
};

// The connection is global for all requests
var client ;

function redisSet(bonkers, callback) {

  var config = bonkers.config;
  var debug = bonkers.debug;

  // First time we create the client
  // Fix - we need to reset the client is config params are changed
  if (client === undefined) {
    client = redis.createClient(config.port , config.host , redisOptions);

    client.on('error', function(error) {
      debug('redis had an error', error);
      //callback(error);
    });

  }

  client.set('test', 'ok', function(err, reply) {
    debug('the set finished', err);
    callback(err, reply);
  });


}

module.exports = {
  request: redisSet
};
