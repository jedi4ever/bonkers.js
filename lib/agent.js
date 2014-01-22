#!/usr/bin/env node
// -*- mode: javascript -*-
// vi: set ft=javascript :

'use strict';

var http = require('http');
var async = require('async');
var debug = require('debug')('bonkers:agent');
var scenarioDebug = require('debug')('bonkers:scenario');
var domain = require('domain');

var bonking = false;
var iterationsTodo = 0;

var config = {
  n: 1,
  concurrency: 1,
  host: '127.0.0.1',
  port: 80,
  path: '/',
  controlPort: 8889,
  scenario: 'redis-set'
};

var stats = {
  clients: 0,
  inproc: 0,
  errors_req: 0,
  errors_resp: 0,
  ended_req: 0,
};

// Default scenario = http-get
var makeRequest = require('./scenarios/'+config.scenario).request;

var q = async.queue(function (task, callback) {


  // Prepare the elements to pass to the request
  var Bonkers = {
    config: config,
    debug: scenarioDebug
  };
  // If we are bonking
  if (bonking) {

    iterationsTodo--;
    // Invoke the request
    debug('making Request');
    makeRequest(Bonkers, function(err, result) {
      // http://glynnbird.tumblr.com/post/56234140267/using-node-js-async-queue-to-control-batch-jobs
      setImmediate(function() { callback();  });
    });

  } else { // We're not bonking, let the queue drain
    callback();
  }

}, config.concurrency);

var schedulerTime = 100;

var scheduler = function() {
  debug('scheduling - are we bonking?', bonking, iterationsTodo, config.n);
  // Keep filling the queue to the maximum

  if (bonking && (iterationsTodo <= config.n)) {
    // Add either the numer of iterations or the queue size
    var extraTasksNeeded = Math.min(iterationsTodo, config.concurrency - q.length());

    if (extraTasksNeeded > 0) {
      debug('adding extra tasks to queue', extraTasksNeeded, q.length());
      async.times(extraTasksNeeded, function(n, next) {
        q.push({ });
        next();
      },function(err) {
        if (err) {
          debug('error adding to the queue', err);
          process.exit(-1);
        } else {
          setTimeout(scheduler, schedulerTime);
        }
      });
    } else {
      // Currently no need to add things to the queue
      setTimeout(scheduler, schedulerTime);
    }
  } else {
    bonking = false;
    setTimeout(scheduler, schedulerTime);
  }
};

setImmediate(scheduler);

console.log('==== Client Started ===== Time: '+new Date().toISOString());

/*
   setInterval(function() {
   console.log(JSON.stringify(stats));
   }, 1000);
   */

// Controlling server.
http.createServer(function (req, res) {
  if (req.method === 'GET') {
    var url = require('url').parse(req.url, true);

    if (url.pathname === '/') {
      // Return stats on '/'
      return res.end(JSON.stringify(stats) + '\n');

    } else if (url.pathname === '/set') {
      debug('received set', config);
      // Set params on '/set', preserving the type of param.
      for (var key in url.query) {
        config[key] = (typeof config[key] == 'number') ? +url.query[key] : url.query[key];
      }
      return res.end(JSON.stringify(config) + '\n');

    } else if (url.pathname === '/reload') {
      // Restart process on '/reload'
      require('child_process').exec('sudo restart agent', function() {});
      return res.end('OK\n');
    } else if (url.pathname === '/bonk') {
      debug('received bonk');
      iterationsTodo = config.n;
      bonking = true;
      return res.end('OK\n');

    } else if (url.pathname === '/nobonk') {
      debug('received nobonk');
      bonking = false;
      iterationsTodo = 0;
      return res.end('OK\n');
    }
  }
  res.writeHead(404);
  res.end();
}).listen(config.controlPort);
