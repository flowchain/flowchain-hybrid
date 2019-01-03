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

var SeqList = require('seqlist');
var crypto = require('crypto');
var chalk = require('chalk');
const {
  stratumSerialize,
  stratumDeserialize,
  StratumSubscribe  
} = require('../libs/stratum');
const { 
  utils,
  LOGI
} = require('../utils');

function Lambda()
{
  this.sHeaderHash = '';
  this.sSeedHash = '';
  this.sShareTarget = '';
  this.nonce = 1;  
}

var sLambda = null;

function getInstance() {
  if (!sLambda) {
    sLambda = new Lambda();
  }
  return sLambda;
}

Lambda.prototype.generateLambdaPuzzle = function(nonce, header) {
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

var sBlockHeight = 1;

Lambda.prototype.prepreBlock = function(work)
{
    this._setWork(work);
    // The miner is synchronous
    var hash = this._miner();

    //LOGI("Received new job #" + sHeaderHash.substr(0, 8));

    LOGI(chalk.red('Block ' + sBlockHeight + ' found') + ' 0x' + hash.toString(16));
    sBlockHeight++;

    var diff = stratumDeserialize(work).result[2];
    LOGI('Target difficulty: ' + diff)
    
    var block = {
      height: sBlockHeight,
      blockHash: hash.toString(16),
      nonce: this.nonce,
      lambda: this.getLambdaString(),
      puzzle: JSON.parse(this.getPuzzle())
    };

    return block;
};

Lambda.prototype.appendVirtualBlocks = function(block, virtual_blocks)
{
    block['merkle_dag'] = virtual_blocks;

    var result  = {
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_submitWork',
      params: [
        this.sHeaderHash,
        this.sSeedHash,
        // the shared difficulty from the mining pool
        this.sShareTarget
      ],
      miner: '',
      block: block,
      txs: virtual_blocks
    };

    return result;
};

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
    sLambda.generateLambdaPuzzle(nonce, header);

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

    var difficulties = [];
    var nonce = this.nonce;

    // The shared difficulty
    difficulties.push(this.sShareTarget);

    while (MAX_LOOPS-- > 0) {
      var hash = virtualMiner(nonce, this.sHeaderHash, this.sSeedHash);

      if ( utils.hexToBigInt(hash) <= utils.hexToBigInt(difficulties[0]) ) {
        this.nonce = nonce;
        return hash;
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

module.exports = getInstance();