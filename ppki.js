/**
 * MIT License
 * 
 * Copyright (c) 2017 Jollen Chen
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var trim = require('lodash/trim');
var lambda = require('./consensus/lambda');
var Client = require('./consensus/client');
const { 
  utils,
  LOGI
} = require('./utils');

/*
 * Proxy
 */
var gHashrate = {};

var delegateHashrate = function(payload, worker) {
    // payload: {"jsonrpc":"2.0", "method":"eth_submitHashrate", "params":["0x0000000000000000000000000000000000000000000000000000000000500000", "0x59daa26581d0acd1fce254fb7e85952f4c09d0915afd33d3886cd914bc7d283c"],"id":73}

    // update the hashrate of each miner
    var obj = JSON.parse(payload);
    gHashrate[worker] = parseInt(obj.params[0]);
};

var submitHashrate = function(socketId) {
    // compute the total hashrate
    var hashrate = 0;
    for (var worker in gHashrate) {
      hashrate = hashrate + gHashrate[worker];
    }

    // refresh the hash rates, see startSubmitInterval()
    gHashrate = {};

    var result = {
      "id": 1,
      "jsonrpc": "2.0",
      "method": "eth_submitHashrate",
      "params": [
      	'0x'+hashrate.toString(16),
      	client.ids[0]
      ]
    };

    var speed = hashrate / 1000000 ;
    LOGI('Speed ' + speed.toFixed(2) + ' Mh/s');

    client.submit(result, socketId);
};

/*
 * The application server
 */
var http = require('http');
var url = require('url');

var pathToRegExp = function(path) {
  if (typeof(path) === 'string') {
      if (path === '*') {
          path = /^.*$/;
      }
      else {
          //path = path.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
          path = new RegExp('^' + path + '$');
      }
  }
  return path;
};

function route(pathname, routing, req, res) {
  for(var path in routing) {
    var handler = routing[path];
    var pathExp = pathToRegExp(path);
  
    if (!(pathExp instanceof RegExp)) {
      throw new Error('Path must be specified as either a string or a RegExp.');
    }
  
    if (typeof handler === 'function') {
      if (pathExp.test(pathname)) {
        routing[path](req, res);
      }
    } else {
      console.info('no request handler for ' + pathname);
    }
  }
}

var tasks = {};
var appServer = http.createServer(function(req, res) {
    var pathname = url.parse(req.url).pathname;

    var handlers = {
      getWorkerName: function(req, res) {
        // url: /:walletAddress/:workerName
        var paths = req.pathname.split('/');
  
        if (paths.length === 3) {
           req.params = {
             wallet: paths[1],
             worker: paths[2]
           };
           LOGI(chalk.red('Worker [' + req.params.worker + '] from ' + req.params.wallet));
           return true;
        }
  
        return false;
      }
    };

    var routing = {
        '/([A-Za-z0-9-]+)/([A-Za-z0-9-]+)': handlers.getWorkerName,
    };

    req.pathname = pathname;
    route(pathname, routing, req, res);

    if (req.method == 'POST') {
      var body = '';

      req.on('data', function (data) {
        body += data;
      });

      req.on('end', function () {
      // {"id":1,"jsonrpc":"2.0","method":"eth_getWork"}
        if (typeof body === 'undefined') {
            return;
        }

        var obj = JSON.parse(body);

        switch (obj.method) {
        case 'eth_getWork':
          tasks[req.params.worker] = getCurrentWorkSocketId();

          var work = stratumDeserialize(getCurrentWork());

          if (!work) {
            LOGI('No shared work, try again.');
            break;
          }

          var response = lambda.setWorkForResult(work);

          LOGI(chalk.red('Broadcasting lambda: 0x' + lambda.getLambdaString()));

          res.writeHead(200, {'Content-Type': 'text/json'});
          res.end(response);
          break;

        default:
        }

        res.end();
      });
    }
});

function Miner(options) {
  this.client = new Client();
  this.options = options;
}

Miner.prototype.start = function(options) {
  this.client.start(appServer, options || this.options);  
}

module.exports = Miner;
