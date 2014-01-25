'use strict';
var http = require('http');
var request = require('request');

var pool;
function setup(bonkers, callback) {
  var config = bonkers.config;
  var debug = bonkers.debug;

  pool = { maxSockets: config.concurrency };
  debug('setting http request pool to ', config.concurrency);

  callback(null);
}

function cleanup(bonkers, callback) {
  callback(null);
}

function getRequest(bonkers, callback) {
  var config = bonkers.config;
  var debug = bonkers.debug;

  var url = 'http://'+ config.host + ':' + config.port + config.path;

  var reqOptions = {
    url: url,
    pool:pool
  };

  var req = request.get(reqOptions, function(err, response, body) {

    if (err) {
      callback(err);
    } else {
      if (response.statusCode === 200) {
        callback(null);
      } else {
        debug('statuscode', response.statusCode, body, reqOptions);
        callback(new Error('non 200 status code'));
      }
    }
  });

}

module.exports = {
  setup: setup,
  request: getRequest,
  cleanup: cleanup,
};
