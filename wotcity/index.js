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

"use strict";

var http = require('http');
var crypto = require('crypto');

// The Flowchain log system
var Log = require('../Log');
var TAG = 'Flowchain/Hybrid';
var TAG_IPFS = 'FLowchain/IPFS';
var TAG_SERVER = 'Flowchain/Server';
var TAG_EDGE = 'Flowchain/Edge';

/**
 * Expose `createApplication()`.
 */
 if (typeof(module) != "undefined" && typeof(exports) != "undefined")
  exports = module.exports = createApplication;

/**
 * Module dependencies.
 */
var RequestHandlers = require("./requestHandlers")
  , merge = require('utils-merge')
  , express = require('express')
  , path = require('path')
  , bodyParser = require('body-parser')
  , Cookies = require('cookies')
  , cors = require('express-cors');

/**
 * The Websocket URL router.
 */
var wsHandlers = {
   "/streams/([A-Za-z0-9-]+)/send": RequestHandlers.send
};

/**
 * The `onedge` event handler receives messages from the p2p network and
 * submits virtual blocks to the private blockchain. 
 *
 * @param {Object} req The client `request` object
 * @param {Object} res The server `response` object
 * @return {Object}
 * @api public
 */
var onedge = function(req, res) {
    var payload = req.payload;
    var block = req.block;
    var node = req.node;

    var data = JSON.parse(payload.data);
    var message = data.message;
    var from = data.from;

    // Key of the data
    var key = message.id;

    // virtual_blocks
    var virtual_blocks = message.data;

    Log.i(TAG_EDGE, 'Submit #' + key + ' to the flowchain network');

    return app.miner.submitVirtualBlocks(virtual_blocks);
};

/**
 * The express application
 */
var app = express();

/**
 * The main application class which provides rest APIs.
 */
var Application = {

  /**
   * Start a Flowchain Ledger server.
   *
   * @return {None}
   * @api public
   */
  start: function() {
    app.node = this.node;
    app.ipfs = this.ipfs;
    app.miner = this.miner;

    app.use(cors());

    app.use(function(req, res, next) {
      // Handling flowchain data chunks
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader("Connection", "");
      next();
    });

    app.post('/streams/:object/send', function(req, res, next) {
      var ipfs = req.app.ipfs;
      var node = req.app.node;
      var miner = req.app.miner;
      var object = req.params.object;

      Log.i(
        TAG,
        'Stream Connected: ' + req.socket.remoteAddress + 
        ':' + req.socket.remotePort 
      );

      req.on('data', function(data) {
        app.node.submit(data);
      });

      req.on('end', function() {
      });
    });

    var server = http.createServer(app).listen(this.port, this.host, function() {
      Log.i(TAG_SERVER, 'HTTP stream server start at http://' + this.host + ':' + this.port);
      Log.i(TAG_SERVER, 'Starting Flowchain ledger system and join the network.');

      /**
       * Start the IoT node and join the p2p network.
       * When success, the IoT node will begin to broadcast lambda and puzzles.
       */
      app.node.start({
        onedge: onedge
      });

      /**
       * Start the PPKI miner
       */
      app.miner.start();

    }.bind(this));
  }
};

/**
 * Create an WoT application.
 *
 * @return {Object}
 * @api public
 */
function createApplication(options) {
  return merge(Application, options);
}
