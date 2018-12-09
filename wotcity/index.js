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

// The Flowchain log system
var Log = require('../Log');
var TAG = 'Flowchain-ledger';
var TAG_IPFS = 'FLowchain-IPFS';

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
 * Websocket URL Router
 */
var wsHandlers = {
   "/streams/([A-Za-z0-9-]+)/send": RequestHandlers.send
};

var app = express();

/*
 * Prototype and Class
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
      var object = req.params.object;

      Logi.i(
        TAG,
        'Stream Connected: ' + req.socket.remoteAddress + 
        ':' + req.socket.remotePort 
      );

      req.on('data', function(data) {
      	// Get the IPFS hash (filename)
      	var ipfsVideoHash = this.ipfs.add(
      	    data
      	);

	      // Submit transactions
	      Log.i(TAG_IPFS, 'The chunked data is stored at IPFS with' + ipfsVideoHash);
        this.app.node.submit(data);
      });

      req.on('end', function() {
      });
    });

    Log.i(TAG, 'Starting Flowchain ledger system and join the network.');
    this.node.start();
    this.miner.start();
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
