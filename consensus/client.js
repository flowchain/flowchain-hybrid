var crypto = require('crypto');
var net = require('net');
var extend = require('lodash/extend');
var validateConfig = require('../validateConfig');
var WorkObject = require('../workObject/StratumEthproxy');
const { 
  LOGI
} = require('../utils');

/**
 * Util APIs
 */
var connect = function(socketId, server, onConnect) {
    LOGI('Connect to ' + server.host + ':' + server.port, ', id:', server.id);

    this.socket[socketId].connect(server.port, server.host, function() {
        if (onConnect) {
            onConnect.call(this, socketId, server);
        }
    }.bind(this));
};

/**
 *  Handlers
 */
/**
 * @param server the server object
 */
var onConnect = function(socketId, server) {
  LOGI('Connected to server', server.host + ':' + server.port);

  var data = StratumSubscribe['STRATUM_PROTOCOL_ETHPROXY'];

  this.submit(data, socketId);

  // call global actions
  startSubmitInterval(socketId);
};

var onClose = function() {
  LOGI('Connection closed');
};

var onError = function(error) {
  LOGI('Error: ' + error.message)
};

var onAuthorize = function() {
  LOGI('Worker authorized');
};

var onNewDifficulty = function(newDiff) {
  LOGI('New difficulty', newDiff);
};

var onSubscribe = function(subscribeData) {
  LOGI(subscribeData);
};

var onNewMiningWork = function(newWork) {
  LOGI(newWork);
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
var getCurrentDifficulty = function() {
    return stratumDeserialize(getCurrentWork()).result[2];
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
var onDataSetWork = function(payload) {
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
      return setCurrentWork(data);
    }
}

var onData = function(payload) {
    var obj = stratumDeserialize(payload);

    if (!obj) {
      return;
    }

    if (typeof obj.id === 'undefined') {
      return;
    }

    var id = obj.id || 0;
    var result = obj.result;

    onDataSetWork(payload);

    if (typeof result === 'object') {
        var sHeaderHash = result[0];
        var sSeedHash = result[1];
        var sShareTarget = result[2];

        gLambda.setWorkForResult(payload);
    }
}

/**
 * Miner
 */
var defaultConfig = {
  "autoReconnectOnError": true,
  autoReconnectOnError: true,
  onConnect: onConnect,
  onClose: onClose,
  onError:  onError,
  onAuthorize: onAuthorize,
  onNewDifficulty: onNewDifficulty,
  onSubscribe: onSubscribe,
  onNewMiningWork: onNewMiningWork  
};

function Client()
{
    this.ids = {};
    this.socket = {};
    this.options = {};
    this.workObjects = [];

    return this;
}

Client.prototype.start = function(appServer, options)
{
  var updatedOptions = extend({}, defaultConfig, options);
  validateConfig(updatedOptions);
  this.startClientWithAppServer(appServer, updatedOptions);
}

Client.prototype.startClientWithAppServer = function(appServer, updatedOptions)
{
    var workObject = new WorkObject();    
    this.workObjects.push(workObject);

    var id = updatedOptions.serverId;
    var server = updatedOptions.servers[id];

    if (id >= 0) {
    	// Synchronously generate a random hexadecimal (32 bytes) ID identifying the client
    	// used by eth_submitHashrate and etc
    	this.ids[id] = '0x'+crypto.randomBytes(32).toString('hex');

      this.socket[id] = new net.Socket();
      this.socket[id].updatedOptions = updatedOptions;
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

    // start the API server
    appServer.listen({
      port: updatedOptions.apiServer.port,
      host: updatedOptions.apiServer.host
    }, function() {
      LOGI('Hybrid node API server started on',  updatedOptions.apiServer.host, 'at port', updatedOptions.apiServer.port);
    });    
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
 * TODO: Use memory cache to cache pending virtual blocks
 */
var gPendingVirtualBlocks = [];
Client.prototype.submitVirtualBlocks = function(vBlocks)
{
    gPendingVirtualBlocks.push(vBlocks);
}

/*
 * Verify Virtual Blocks in the private blockchain and
 * send the crossponding transactions to the public blockchains.
 */
Client.prototype.submitBlocks = function(result) {
    for (var key in this.ids) {
      var id = this.ids[key];
      result['miner'] = id;

      for (var i = 0; i < gPendingVirtualBlocks.length; i++) {
        result['txs'][i] = gPendingVirtualBlocks[i];
      }
      
      this.socket[key].write(stratumSerialize(result));
    }

    // Clear cache
    gPendingVirtualBlocks = [];
}

module.exports = Client;
