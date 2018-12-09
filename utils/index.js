var bigInt = require("big-integer");
var moment = require('moment');
var chalk = require('chalk');

var hexToBigInt = function(hex) {
    var v = bigInt(hex.replace('0x', ''), 16);
    return v;
};

/**
 * Left-pad a hex string
 */
String.prototype.pad = function(string, length) {
    var str = this;
    while (str.length < length)
        str = string + str;
    return str;
}


/**
 * Log utils
 */
var TAG = 'flowchain';

var _getTimeStamp = function() {
    var ts = moment().toISOString();
    var _ts = ts.split(/[T:\.Z]/); // [ '2018-06-24', '03', '55', '14', '303', '' ]    

    return ('[' + chalk.green(TAG + '') + ' ' +
            _ts[1] + ':' +
            _ts[2] + ':' +
             chalk.red(_ts[3]) +
             ']');
}; 
var LOGI = function(msg) {
  console.log(_getTimeStamp(), msg);
};

module.exports = {
    hexToBigInt,
    LOGI
};
