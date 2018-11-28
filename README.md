![](https://flowchain.co/static/logo-text@128.png)

The fast and light-weight Flowchain hybrid node library.

# flowchain-node

The `flowchain-hybrid` is a fast and light-weight Flowchain hybrid node that can mine FlowchainCoin. It is the *hybrid consensus node* across the Flowchain hybrid blockchain network that connects to the public blockchain and provides the puzzle and `λ` values to the private blockchains.

# Introduction

To bootstrap a new blockchain network, the mining pool uses to the Stratum protocol to join an existing blockchain network, such as Bitcoin and Ethereum, to generate the `λ` value.

# Prerequisite

For MacOS users:

* Command Line Tools for Xcode - Run ```xcode-select --install``` for installation
* Node 9.4.0
* NPM 5.6.0

For Ubuntu users:

* Ubuntu 16.04 or above
* Build-essential package - Run ```sudo apt-get install build-essential``` for installation
* Node 9.4.0
* NPM 5.6.0


# How to Use

## Use Flowchain testnet

Start the ```index.js``` Flowchain node:

```
$ node index.js 
Connect to testnet.pool.flowchain.io:3333 , id: 0
HTTP server started on port 55752.
Connected to server testnet.pool.flowchain.io:3333
Received shared work:  0xcc834fd577df20a16a1faa791633a9a47e3058241f5d07891ef6126f89907c22
[flowchain-dev0] Received new job #0xcc834f
 seed: #0xfcf7d78601c4fd5d68fc7f00bc0641
 target: #0x89705f4136b4a59731680a
New block found: 0x0010eaea9cc48cf9ec2b35b2230498cae773d2c9d27101670377bb5b00f9c255
```

Use the Stratum protocol ```eth_getWork``` to get the lambda value. The simplest way to do it is using ```curl```:

```
$ curl -X POST -d '{"id":1,"jsonrpc":"2.0","method":"eth_getWork"}' http://localhost:55752/0x0/jollen
```

The response:

```
{"lambda":"5af90b68f9051a6fe1b5a2006cc345dbeafbf9df5d4ae8cc6399f515b51bdb19","puzzle":{"q1":["f","f","f","f"],"q2":["0","0","0","0"]}}
```

The response message indicates that the lambda value is ```5af90b68f9051a6fe1b5a2006cc345dbeafbf9df5d4ae8cc6399f515b51bdb19```, meaning that the entities has to solve the puzzle by this value in a fixed time interval. In short, the entity will receive *Puzzle* from peers, and the Puzzle has 8 to 10 shared works from the Ethereum pool.

# Submit Transactions

Use `flowchain-ledger` to submit transactions.

```
var PeerNode = require('flowchain-ledger').PeerNode;
var node = new PeerNode();;
node.submit(data);
```

# Bibliography

This work is based on the research paper.

[1] Chen, J. (2018). [Hybrid Blockchain and Pseudonymous Authentication for Secure and Trusted IoT Networks](https://flowchain.co/flowchain-AIoTAS18_ACCEPTED.pdf) In: The 2nd Workshop on Advances in IoT Architecture and Systems, Los Angeles, California, USA.

# How to Cite

```
@article{flowchain_2018,
title={Hybrid Blockchain and Pseudonymous Authentication for Secure and Trusted IoT Networks},
journal={Proceedings of the 2nd Workshop on Workshop on Advances in IoT Architecture and Systems (AIoTAS2018)},
author={Chen, Jollen},
year={2018}
},
```

# License

Copyright (C) 2018 [Jollen Chen](https://github.com/jollen). The source code is licensed under the MIT license found in the [LICENSE](LICENSE) file.
