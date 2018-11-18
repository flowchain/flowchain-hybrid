var bigInt = require("big-integer");

var hexToBigInt = function(hex) {
    var v = bigInt(hex.replace('0x', ''), 16);
    return v;
};

module.exports = {
    hexToBigInt
};
