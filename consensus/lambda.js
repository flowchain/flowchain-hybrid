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

var sBlockHeight = 1;

Lambda.prototype.submitBlocks = function(blocks)
{
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
      virtualBlocks: blocks,
      txs: []
    };

    client.submitBlocks(result);
};

Lambda.prototype.setWorkForResult = function(work)
{
    this._setWork(work);
    // The miner is synchronous
    var hash = this._miner();

    //LOGI("Received new job #" + sHeaderHash.substr(0, 8));

    LOGI(chalk.red('Block ' + sBlockHeight + ' found') + ' 0x' + hash.toString(16));
    sBlockHeight++;

    var result = {
      height: sBlockHeight,
      nonce: this.nonce,
      lambda: this.getLambdaString(),
      puzzle: JSON.parse(this.getPuzzle())
    };

    this.submitBlocks([ {
      height: sBlockHeight,
      blockHash: hash.toString(16),
      nonce: this.nonce,
      lambda: this.getLambdaString(),
      puzzle: JSON.parse(this.getPuzzle())
    } ]);

    return stratumSerialize(result);
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

module.exports = Lambda;