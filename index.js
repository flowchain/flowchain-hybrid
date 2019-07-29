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

'use strict';

/**
 * Config the logger system.
 */
var TAG = 'Hybrid';
var Log = require('./Log');

/**
 * Start the miner.
 *
 * The flowchain hybrid node is also the miner of digital assets 
 */
var Miner = require('./ppki');
var miner = new Miner({
  // Default use Flowchain testnet
  servers: [
    {
      id: 0,
      host: "testnet.pool.flowchain.io",
      port: process.env.POOL_PORT || 3333
    }
  ],
  apiServer: {
    host: process.env.API_HOST || '127.0.0.1',
    port: process.env.API_PORT || '55752'
  },
  // the server id to use    
  serverId: 0,
  worker: "flowchain-testnet",
  miner: '[PLEASE PUT YOUR SIGNED MINER ADDRESS HERE]'
});

/**
 * Flowchain Ledger IoT Node
 */
var BootNode = require('flowchain.js').BootNode;

/**
 * IPFS Client
 */
var IpfsApi = require('ipfs-api');

/**
 * REST APIs
 */
var http = require('http'),
    httpProxy = require('http-proxy');

/**
 * The WoT.City servient library.
 */
var wotcity = require('./wotcity');

/**
 * Create a WoT.City application singleton instance.
 */
var app = wotcity({ 
  host: process.env.REST_HOST || '0.0.0.0', 
  port: process.env.REST_PORT || 8100 
});

/**
 * Create a Flowchain Ledger application singleton instance.
 */
app.node = new BootNode();

/**
 * Create an IPFS client instance.
 */
app.ipfs = IpfsApi({
  host: 'localhost',
  port: 5001,
  protocol: 'http',
  headers: {
    authorization: 'FLC ' //+ TOKEN
  }
});

/**
 * Setup the the Flowchain Hybrid node.
 */
app.miner = miner;

/**
 * Start the Flowchain Hybrid node.
 */
Log.i(TAG, 'Starting Flowchain Hybrid node...');
app.start();

/**
 * Start a proxy server to config HTTP headers. For better performance of HTTP 206 request,
 * some headers of the HTTP server response should be removed.
 */
var proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('Transfer-Encoding', 'chunked');
  proxyReq.setHeader("Connection", "close");
 
  proxyReq.removeHeader('Content-Length');
  proxyReq.removeHeader('Accept-Encoding');
  proxyReq.removeHeader('Accept-Language');
  proxyReq.removeHeader('Content-Type');
  proxyReq.removeHeader('Referer');
});

/**
 * Start a HTTP web server and proxy the requests.
 */
var server = http.createServer(function(req, res) {
  var host = process.env.REST_HOST || '0.0.0.0';
  var port = process.env.REST_PORT || 8100;

  var url = 'http://' + host + ':' + port;

  // You can define here your custom logic to handle the request
  // and then proxy the request.
  proxy.web(req, res, {
    target: url
  });
}).listen(process.env.PROXY_PORT || 8800);

Log.i(TAG, 'Proxy server starts at port 8800');
