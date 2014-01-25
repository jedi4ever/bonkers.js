'use strict';

var debug = require('debug')('bonkers');

var fs = require('fs');
var path = require('path');
var Handlebars = require('handlebars');

// Prepare userdata and do a basic templating
function generate(config) {

  var userDataFile = __dirname + '/../../templates/cloud-config.sh' || config.userDataFile;

  var userDataSource = fs.readFileSync(userDataFile, 'utf8');

  var template = Handlebars.compile(userDataSource);

  var agentSource = fs.readFileSync(__dirname + '/../agent.js', 'utf8');

  var userDataParams = {
    scenarios: [ ],
    dependencies: [],
    scripts: [],
    agent: [
      { name: 'agent', source: agentSource } ,
    ],

  };

      //{ name: 'redis-set', source: source2 },
  var scenarioNames = Object.keys(config.scenarios);
  scenarioNames.forEach(function(key) {
    var filename  = path.resolve(config.scenarios[key]);
    var source  = fs.readFileSync(filename, 'utf8');
    userDataParams.scenarios.push({ name: key , source: source});
  });

  var nodeModules = Object.keys(config.dependencies);
  nodeModules.forEach(function(key) {
    userDataParams.dependencies.push({ name: key , version: config.dependencies[key]});
  });

  var scripts = Object.keys(config.scripts);
  scripts.forEach(function(key) {
    var filename  = path.resolve(config.scripts[key]);
    var source  = fs.readFileSync(filename, 'utf8');
    userDataParams.scripts.push({ name: key , source: source});
  });

  //dependencies: config.dependencies,

  debug(userDataParams.dependencies);
  var userdata = template(userDataParams);
  return userdata;
}

module.exports = {
  generate: generate
};
