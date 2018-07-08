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
var net = require('net');
var crypto = require('crypto');
var extend = require('lodash/extend');
var trim = require('lodash/trim');
var chalk = require('chalk');
var validateConfig = require('./validateConfig');
var WorkObject = require('./workObject/StratumEthproxy');

/**
 * Utils - pad a hex string
 */
String.prototype.pad = function(string, length) {
    var str = this;
    while (str.length < length)
        str = string + str;
    return str;
}

/**
 * Stratum Protocols Objects
 */
var StratumSubscribe = {
    STRATUM_PROTOCOL_STRATUM: {"id": "1", "method": "mining.subscribe", "params": []},
    STRATUM_PROTOCOL_ETHPROXY: 
    {
        "id": 1, 
        "worker": "flowchain",
        "method": "eth_submitLogin", 
        "params": ["0xA3b2692eD05309a33F589cdb197767bc257D7C2B"]
    },
    STRATUM_PROTOCOL_ETHEREUMSTRATUM: {
        id: 1, 
        method: "mining.subscribe",
        params: ["ethminer/flowchain-dev.0", "EthereumStratum/1.0.0"],
    }
};

var stratumSerialize = function(data) {
    if (typeof data === 'object') 
      return JSON.stringify(data) + '\n';

    if (typeof data === 'string') 
      return data.trim()+'\n';

    return '{}\n';
};


var stratumDeserialize = function(data) {
    if (data && typeof data === 'object')
	return data;

    if (data && typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }

    return null;
};

/**
 * Util APIs
 */
var connect = function(socketId, server, onConnect) {
    console.log('Connect to ' + server.host + ':' + server.port, ', id:', server.id);

    this.socket[socketId].connect(server.port, server.host, function() {
        if (onConnect) {
            onConnect.call(this, socketId, server);
        }
    }.bind(this));
};

/**
 * Miner
 */
var defaultConfig = {
  "autoReconnectOnError": true
};

var onError = function(error, socket, server) {
    var autoReconnectOnError = options.autoReconnectOnError;

    console.log(' Error |', error);
    console.log('Retrying...');
    connect(socket, server);
};

/**
 * Handling `STRATUM_PROTOCOL_ETHPROXY` protocol.
 *
 * {"id":0,
 * "jsonrpc":"2.0",
 * "result":["0x2a43acdbb884f0229c524319b9e44b9f68c56f97f2db3ab50a9b5d6a90b08634",
 * "0x54b9a9340e01b25ac62395cca6daeb5ef7bd4136393446ed4ed73256b0e44f59",
 * "0xa7c5ac471b4784230fcf80dc33721d53cddd6e04c059210385c67dfe32a0"]}
 *
 * libstratum/EthStratumClient.cpp
 */
var gCurrentWork = {};
var getCurrentWorkId = function() {
    return stratumDeserialize(getCurrentWork()).id;
};
var getCurrentWorkSocketId = function() {
    return gCurrentWork.socketId;
};
var getCurrentWork = function() {
    return gCurrentWork.work;
};
var setCurrentWork = function(work) {
    var workObject = {
      work: ''
    };

    if (typeof work === 'object') {
      workObject.work = JSON.stringify(work);
    } else {
      workObject.work = work;
    }

    gCurrentWork = workObject;
};

/*
 * Socket client
 */
var _onDataSetWork = function(payload) {
    var data = stratumDeserialize(payload);
    var extraData = null;

    if (!data) {
      payload = payload.replace(/\n+\s+/, '');
    	var sanitized = '[' + payload.replace(/}{/g, '},{') + ']';
        try {
          var res = JSON.parse(sanitized);
          data = stratumDeserialize(res[0]);
          extraData = stratumDeserialize(res[1]);
        } catch (e) {
            return null;
        }
    }

    // eth_getWork
    if (data.result && typeof data.result === 'object') {
      console.log('Received shared work: ', data.result[0]);
      return setCurrentWork(data);
    }
}

var onData = function(payload) {
    var obj = stratumDeserialize(payload);

    var id = obj.id || 0;
    var result = obj.result;

    _onDataSetWork(payload);

    if (typeof result === 'object') {
        var sHeaderHash = result[0];
        var sSeedHash = result[1];
        var sShareTarget = result[2];

        console.log("[flowchain-dev0] Received new job #" + sHeaderHash.substr(0, 8));
        console.log(" seed: #" + sSeedHash.substr(0, 32));
        console.log(" target: #" + sShareTarget.substr(0, 24));

        gLambda.setWorkForResult(payload);
    }
}

function Client()
{
    this.ids = {};
    this.socket = {};
    this.options = {};
    this.workObjects = [];

    return this;
}

Client.prototype.start = function(options)
{
    var updatedOptions = extend({}, this.options, options);
    validateConfig(updatedOptions);

    var workObject = new WorkObject();
    this.workObjects.push(workObject);

    idx = updatedOptions.serverId;

    if (idx >= 0) {
      var server = options.servers[idx];
      var id = server.id;

    	// Synchronously generate a random hexadecimal (32 bytes) ID identifying the client
    	// used by eth_submitHashrate and etc
    	this.ids[id] = '0x'+crypto.randomBytes(32).toString('hex');

      this.socket[id] = new net.Socket();
    	this.socket[id].setEncoding('utf8');
      this.socket[id].server = server;
    	this.socket[id].on('data', function(data) {
        	onData.call(this, data);
    	});
    	this.socket[id].on('error', function(error) {
        	onError.call(this, error);
    	});
    	this.socket[id].on('close', function() {
      		if (updatedOptions.onClose) 
        		updatedOptions.onClose();
      		updatedOptions = {};
    	});

    	connect.call(this, id, server, updatedOptions.onConnect);
    }
}

Client.prototype.shutdown = function() 
{
    this.client.end();
    this.client.destroy();
}

Client.prototype.submit = function(payload, socketId) {
    var data = stratumDeserialize(payload);

    this.socket[socketId].write(stratumSerialize(data));
}

/*
 * Proxy
 */
var client = new Client();
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
    console.log('Speed ' + speed.toFixed(2) + ' Mh/s');

    client.submit(result, socketId);
};

var startSubmitInterval = function(socketId) {
    setInterval(function() {
        var body = {"id":1,"jsonrpc":"2.0","method":"eth_getWork"};
        client.submit(body, socketId);
    }.bind(this), 2000);
}

/**
 * @param server the server object
 */
var onConnect = function(socketId, server) {
  console.log('Connected to server', server.host + ':' + server.port);

  var data = StratumSubscribe['STRATUM_PROTOCOL_ETHPROXY'];

  this.submit(data, socketId);

  // call global actions
  startSubmitInterval(socketId);
};

var onClose = function() {
  console.log('Connection closed');
};

var onError = function(error) {
  console.log('Error', error.message)
};

var onAuthorize = function() {
  console.log('Worker authorized');
};

var onNewDifficulty = function(newDiff) {
  console.log('New difficulty', newDiff);
};

var onSubscribe = function(subscribeData) {
  console.log('[Subscribe]', subscribeData);
};

var onNewMiningWork = function(newWork) {
  console.log('[New Work]', newWork);
};

client.start({
  // Stratum servers
  servers: [
    {
	    id: 0,
	    host: "eth-eu.dwarfpool.com",
   	  port: 8008
    },
    {
	    id: 1,
	    host: "eth.pool.flowchain.io",
	    port: 8008
    },
    {
	    id: 2,
      host: "noobpool.com",
   	  port: 8008
    }
  ],
  // the server id to use
  serverId: 1,
  worker: "flowchain-dev",
  autoReconnectOnError: true,
  onConnect: onConnect,
  onClose: onClose,
  onError:  onError,
  onAuthorize: onAuthorize,
  onNewDifficulty: onNewDifficulty,
  onSubscribe: onSubscribe,
  onNewMiningWork: onNewMiningWork
});

/*
 * Stratum Server
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

function Lambda()
{
    this.sHeaderHash = '';
    this.sSeedHash = '';
    this.sShareTarget = '';
    this.nonce = 1;

    return this;
}

Lambda.prototype.generateLambdaPuzzle = function(nonce, header) {
    var SeqList = require('seqlist');
    var crypto = require('crypto');

    // FILL YOUR TOKEN ADDRESS
    var hash = crypto.createHmac('sha256', '0xA3b2692eD05309a33F589cdb197767bc257D7C2B')
        .update( JSON.stringify(header) )
        .digest('hex');
    var arr = hash.split('');
    var seqlist = new SeqList(arr);

    var q1 = seqlist.topk(4, 'max');
    var q2 = seqlist.topk(4, 'min');

    var lambda = hash.replace(q1, '');
    var puzzle = {
        q1: q1,
        q2: q2
    };

    this.lambda = lambda;
    this.puzzle = JSON.stringify(puzzle);

    //console.log('Hash #' + hash);
    //console.log('  Generated puzzle #' + this.puzzle);
    //console.log('  Generated lambda #' + this.lambda);        
};

Lambda.prototype._setWork = function(work)
{
    var workObject = stratumDeserialize(work);

    // the header hash and seed hash come from the ethereum mining pool
    this.sHeaderHash = workObject.result[0];

    this.sSeedHash = workObject.result[1];

    // the shared difficulty from the mining pool
    this.sShareTarget = workObject.result[2];	
}

Lambda.prototype.setWorkForResult = function(work)
{
    this._setWork(work);
    // The miner is synchronous
    this._miner();

    var result = {
      lambda: this.getLambdaString(),
      puzzle: JSON.parse(this.getPuzzle())
    };
    return stratumSerialize(result);
}

var virtualMiner = function(nonce, previousHash, seedHash) {
    // The header of the new block.
    var header = {
        nonce: nonce,
        seed: seedHash,        
        previousHash: previousHash,
        timestamp: new Date()
    };

    var blockHash = crypto.createHmac('sha256', 'Flowchain is magic ;-)')
                        .update( JSON.stringify(header) )
                        .digest('hex');

    // Generate the lambda value and its corresponding puzzle.
    gLambda.generateLambdaPuzzle(nonce, header);

    return blockHash;
}; 

/**
 * The lambda value has to be unique, ramdom, and unattackable. So that, ideally, the lambda value 
 * has to be the nonce value solve the work with a small shared difficulty. However, currently, 
 * in the PoC stage, we just set the shared difficulty at a fix value, and use a PoW algorithm to find the nonce.
 */
Lambda.prototype._miner = function()
{
    var MAX_LOOPS = 1000000;	// 1M

    // FIXME: the difficulty has to be a small number of a shared difficulty from the public mining pool
    var difficulties = [
      '00F8888888888888888888888888888888888888888888888888888888888888',
      '0F88888888888888888888888888888888888888888888888888888888888888'
    ];

    var nonce = this.nonce;

    while (MAX_LOOPS-- > 0) {
      var hash = virtualMiner(nonce, this.sHeaderHash, this.sSeedHash);

      if (hash <= difficulties[0]) {
        console.log(chalk.green('New block found: 0x' + hash.toString(16)));

        this.nonce = nonce;
        return nonce;
      }

      nonce++;
    }

    console.log('Cannot found a valid lambda value. Please try again later.');
    return 0;
}

Lambda.prototype.getValue = function()
{
    return this.nonce;
}

Lambda.prototype.getString = function()
{
    return this.nonce.toString(16);
}

Lambda.prototype.getLambdaString = function()
{
    return this.lambda;
}

Lambda.prototype.getPuzzle = function()
{
    return this.puzzle;
}

// FIXME: The lambda object must be singleton
var gLambda = new Lambda();
var tasks = {};
var server = http.createServer(function(req, res) {
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
        var obj = JSON.parse(body);

        switch (obj.method) {
        case 'eth_getWork':
          tasks[req.params.worker] = getCurrentWorkSocketId();

          var work = stratumDeserialize(getCurrentWork());

          if (!work) {
            console.log('No shared work, try again.');
            break;
          }

          var response = gLambda.setWorkForResult(work);

          console.log(chalk.red('Broadcasting lambda: 0x' + gLambda.getLambdaString()));

          res.writeHead(200, {'Content-Type': 'text/json'});
          res.end(response);
          break;

        default:
        }

        res.end();
      });
    }
});

server.listen({
  port: 55752,
  host: '0.0.0.0'
}, function() {
  console.log('HTTP server started on port 55752.');
});
