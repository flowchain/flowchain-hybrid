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

var getTimeStampForLog = function() {
    var ts = moment().toISOString();
    var _ts = ts.split(/[T:\.Z]/); // [ '2018-06-24', '03', '55', '14', '303', '' ]    

    return ('[' + chalk.green(TAG + '') + ' ' +
            _ts[1] + ':' +
            _ts[2] + ':' +
             chalk.red(_ts[3]) +
             ']');
}; 
var LOGI = function(msg) {
  console.log(getTimeStampForLog(), msg);
};

var utils = {
    hexToBigInt: hexToBigInt
};

module.exports = {
    utils: utils,
    LOGI: LOGI
};
