'use strict';

var debug = require('debug')('bonkers');

var fs = require('fs');
var Handlebars = require('handlebars');

// Prepare userdata and do a basic templating
function generate(config) {

  var userDataFile = __dirname + '/../../templates/cloud-config.sh' || config.userDataFile;

  var userDataSource = fs.readFileSync(userDataFile, 'utf8');

  var template = Handlebars.compile(userDataSource);

  var source1 = fs.readFileSync(__dirname + '/../scenarios/http-get.js', 'utf8');
  var source2 = fs.readFileSync(__dirname + '/../scenarios/redis-set.js', 'utf8');
  var agentSource = fs.readFileSync(__dirname + '/../agent.js', 'utf8');

  var userDataParams = {
    scenarios: [
    ],
    agent: [
      { name: 'agent', source: agentSource } ,
    ],
    dependencies: []

  };

      //{ name: 'redis-set', source: source2 },
  var scenarioNames = Object.keys(config.scenarios);
  scenarioNames.forEach(function(key) {
    userDataParams.scenarios.push({ name: key , sources: config.scenarios[key]});
  });

  var nodeModules = Object.keys(config.dependencies);
  nodeModules.forEach(function(key) {
    userDataParams.dependencies.push({ name: key , version: config.dependencies[key]});
  });

  //dependencies: config.dependencies,

  debug(userDataParams.dependencies);
  var userdata = template(userDataParams);
  return userdata;
}

module.exports = {
  generate: generate
};
