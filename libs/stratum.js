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