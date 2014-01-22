'use strict';
var http = require('http');

function setup(bonkers, callback) {
  callback();
}

function cleanup(bonkers, callback) {
  callback();
}

function request(bonkers, callback) {
    var config = bonkers.config;

    var req = http.request({host:config.host, port:config.port, path:config.path, agent:false});
    req.setNoDelay();

    req.on('response', function(res) {
        /*
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
        });
        */

        res.on('end', function() {
          callback(null);
        });

        res.on('error', function(error) {
          callback(error);
        });
    });
    req.on('error', function(error) {
      callback(error);
    });

    req.end();
}

module.exports = {
  setup: setup,
  request: request,
  cleanup: cleanup,
};
