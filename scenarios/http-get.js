'use strict';
var http = require('http');

function makeRequest(config, stats, clients) {
    stats.inproc++;
    var id = Math.random().toString(36).slice(2);
    var req = http.request({host:config.host, port:config.port, path:config.path, agent:false});
    req.setNoDelay();

    req.on('response', function(res) {
        stats.inproc--;
        stats.clients++;
        clients[id] = req;
        /*
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
        });
        */

        res.on('end', function() {
            if (clients[id]) {
                stats.clients--;
                delete clients[id];
            }
            stats.ended_req++;
        });
        res.on('error', function() {
            if (clients[id]) {
                stats.clients--;
                delete clients[id];
            }
            stats.errors_resp++;
        });
    });
    req.on('error', function() {
        stats.inproc--;
        stats.errors_req++;
    });

    req.end();
}

module.exports = makeRequest;
