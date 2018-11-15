![](https://flowchain.co/static/logo-text@128.png)

The fast and light-weight Flowchain client in 100% JavaScript.

# flowchain-node

The `flowchain-node` is a fast and light-weight Flowchain client that can mine FlowchainCoin. It is also the *hybrid consensus node* across the Flowchain network that connects to the public blockchain and provides the puzzle and `λ` values to the private blockchains.

# Introduction

To bootstrap a new blockchain network, the mining pool uses to the Stratum protocol to join an existing blockchain network, such as Bitcoin and Ethereum, to generate the `λ` value.

# Use ETH Pools

## Prerequisite

For MacOS users:

* Command Line Tools for Xcode - Run ```xcode-select --install``` for installation
* Node 9.4.0
* NPM 5.6.0

For Ubuntu users:

* Ubuntu 16.04 or above
* Build-essential package - Run ```sudo apt-get install build-essential``` for installation
* Node 9.4.0
* NPM 5.6.0

## How to Use

Start the ```index.js``` Flowchain node:

```
$ node index.js 
Connect to eth.pool.flowchain.io:8008 , id: 1
HTTP server started on port 55752.
Connected to server eth.pool.flowchain.io:8008
Received shared work:  0xc19c9e40c8b2f15f0fca6319285c323c34de9412fbc80373ee0321783efdc2b6
[flowchain-dev0] Received new job #0xc19c9e
 seed: #0x0ba3f65a466961c3edca9c346b0309
 target: #0x0112e0be826d694b2e62d0
New block found: 0x0093dfb2d485366527b25b81f972774d6d35af3f32ceef67e5689e149234e2a0
Received shared work:  0xc19c9e40c8b2f15f0fca6319285c323c34de9412fbc80373ee0321783efdc2b6
[flowchain-dev0] Received new job #0xc19c9e
 seed: #0x0ba3f65a466961c3edca9c346b0309
 target: #0x0112e0be826d694b2e62d0
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

## Bibliography

This work is based on the research paper.

[1] Chen, J. (2018). [Hybrid Blockchain and Pseudonymous Authentication for Secure and Trusted IoT Networks](https://flowchain.co/flowchain-AIoTAS18_ACCEPTED.pdf) In: The 2nd Workshop on Advances in IoT Architecture and Systems, Los Angeles, California, USA.

### How to Cite

```
@article{flowchain_2018,
title={Hybrid Blockchain and Pseudonymous Authentication for Secure and Trusted IoT Networks},
journal={Proceedings of the 2nd Workshop on Workshop on Advances in IoT Architecture and Systems (AIoTAS2018)},
author={Chen, Jollen},
year={2018}
},
```

## License

Copyright (C) 2018 [Jollen Chen](https://github.com/jollen). The source code is licensed under the MIT license found in the [LICENSE](LICENSE) file.
