'use strict';

var debug = require('debug')('bonkers');

var yaml = require('js-yaml');
var fs = require('fs');

function readAwsCredentialsSync(fogFile, fogKey) {
  var credential = {};

  debug('reading fog file', fogFile, 'for key', fogKey);
  // Get document, or throw exception on error
  try {
    var fog;
    fog = yaml.safeLoad(fs.readFileSync(fogFile, 'utf8'));

    var fogCreds = fog[fogKey];

    if (fogCreds) {
      credential.accessKeyId = fogCreds[':aws_access_key_id'];
      credential.accessKeySecret = fogCreds[':aws_secret_access_key'];
    }

    return credential;
  } catch (e) {
    debug('error reading fogfile', fogFile, e.toString());
    return null;
  }
}

module.exports = {
  readAwsCredentialsSync: readAwsCredentialsSync
};
