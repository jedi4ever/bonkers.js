'use strict';

var redis = require('redis');

// By default redis will keep trying to reconnect
var redisOptions = {
  //socket_nodelay: true, // this is default , is ok
  //enable_offline_queue: false, // we don't queue request if redis is down
  retry_max_delay: 200, // normally delay doubles after each try (default = null)
  //connect_timeout: false, // normally client will retry, but we can set it to a specific time(ms)
  //max_attempts: null , // we can give up after X tries, but in our case we keep going
};

// The connection is global for all requests
var client ;

function setup(bonkers, callback) {
  var config = bonkers.config;
  var debug = bonkers.debug;

  client = redis.createClient(config.port , config.host , redisOptions);

  var maxSetupTime = 1000;

  var setupWatchdog = setTimeout(function() {
    debug('setup: redis setup did not complete in ' + maxSetupTime);

    callback(new Error('Redis setup did not complete in time'));
  },maxSetupTime);

  client.once('connect', function() {
    debug('setup: connected to redis');
    clearTimeout(setupWatchdog);
    callback();
  });

  client.on('error', function(error) {
    debug('redis had an error', error);
  });
}

function cleanup(bonkers, callback) {
  callback();
}

function cleanup2(bonkers, callback) {
  if (client) {
    if (client.connected) {
      client.quit();
    }
    client.end();
    client.unref();
    client.removeAllListeners('error');
    client.removeAllListeners('connect');
  }
  callback();
}

function request(bonkers, callback) {

  var config = bonkers.config;
  var debug = bonkers.debug;

  var randomKey = Math.random().toString(36).slice(2);

  if (client.connected) {
    client.set(randomKey, 'ok', function(err, reply) {
      debug('the set finished', err);
      callback(err, reply);
    });
  } else {
      callback(new Error('redis not connected'));
  }


}

module.exports = {
  setup: setup,
  request: request,
  cleanup: cleanup
};
