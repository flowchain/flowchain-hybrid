var moment = require('moment');
var chalk = require('chalk');

/**
 * Log utils
 */
var TAG = 'Flowchain/IPFS'
var getTimeStamp = function() {
    var ts = moment().toISOString();
    var _ts = ts.split(/[T:\.Z]/); // [ '2018-06-24', '03', '55', '14', '303', '' ]    

    return ('[' + chalk.green(TAG + '') + ' ' +
            _ts[1] + ':' +
            _ts[2] + ':' +
             chalk.red(_ts[3]) +
             ']');
}; 
var LOGI = function(msg) {
  console.log(getTimeStamp(), msg);
};


module.exports = {
    i: LOGI
};
