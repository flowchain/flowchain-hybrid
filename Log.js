var moment = require('moment');
var chalk = require('chalk');

/**
 * Log utils
 */
var DEFAULT_TAG = 'Flowchain/Hybrid';

var getTimeStamp = function(tag) {
    var ts = moment().toISOString();
    var _ts = ts.split(/[T:\.Z]/); // [ '2018-06-24', '03', '55', '14', '303', '' ]    

    return ('[' + chalk.green(tag + '') + ' ' +
            _ts[1] + ':' +
            _ts[2] + ':' +
             chalk.red(_ts[3]) +
             ']');
}; 
var LOGI = function(tag, msg) {
	if (typeof msg === 'undefined') {
		msg = tag;
		tag = DEFAULT_TAG;
	}
 	console.log(getTimeStamp(tag), msg);
};


module.exports = {
    i: LOGI
};
