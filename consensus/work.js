const {
  stratumSerialize,
  stratumDeserialize,
  StratumSubscribe  
} = require('../libs/stratum');

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

var gCurrentBlock = {};
var setCurrentBlock = function(block) {
    gCurrentBlock = block;
};
var getCurrentBlock = function() {
  return gCurrentBlock;
};

module.exports = {
  getCurrentWorkId: getCurrentWorkId,
  getCurrentWorkSocketId: getCurrentWorkSocketId,
  getCurrentWork: getCurrentWork,
  setCurrentWork: setCurrentWork,
  setCurrentBlock: setCurrentBlock,
  getCurrentBlock: getCurrentBlock
};
