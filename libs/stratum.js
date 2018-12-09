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
 
/**
 * Stratum Protocols Objects
 */
var StratumSubscribe = {
    STRATUM_PROTOCOL_STRATUM: {"id": "1", "method": "mining.subscribe", "params": []},
    STRATUM_PROTOCOL_ETHPROXY: 
    {
        "id": 1, 
        "worker": "flowchain",
        "method": "eth_submitLogin", 
        "params": ["0xA3b2692eD05309a33F589cdb197767bc257D7C2B"]
    },
    STRATUM_PROTOCOL_ETHEREUMSTRATUM: {
        id: 1, 
        method: "mining.subscribe",
        params: ["ethminer/flowchain-dev.0", "EthereumStratum/1.0.0"],
    }
};

var stratumSerialize = function(data) {
    if (typeof data === 'object') 
      return JSON.stringify(data) + '\n';

    if (typeof data === 'string') 
      return data.trim()+'\n';

    return '{}\n';
};


var stratumDeserialize = function(data) {
    if (data && typeof data === 'object')
	return data;

    if (data && typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }

    return null;
};

module.exports = {
    stratumSerialize,
    stratumDeserialize,
    StratumSubscribe
};