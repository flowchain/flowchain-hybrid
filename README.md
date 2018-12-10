![](https://flowchain.co/static/logo-text@128.png)

The fast and light-weight Flowchain hybrid consensus miner.

# Introduction

The `flowchain-hybrid` is a fast and light-weight Flowchain hybrid node that can mine FlowchainCoin. It is the *hybrid consensus node* across the Flowchain hybrid blockchain network that connects to the public blockchain and provides the puzzle and `λ` values to the private blockchains.

![flowchain-network](https://user-images.githubusercontent.com/1126021/49709543-d599dc80-fc6f-11e8-9015-b08731351864.png)

Flowchain aims to implement a blockchain that can provide a distributed ledger technology for the IoT and AI. Flowchain already proposed the virtual blocks technology that can ensure chunked data (data streams) transactions in a near-instant manner. Furthermore, the virtual block technology can integrate with IPFS, an emerging distributed storage blockchain and can work as an off-chain mechanism to transfer your digital assets from one trusted party to another. Flowchain shows the implementation of a distributed storage using Flowchain and IPFS open source technologies.

In the Flowchain network, hybrid node (aka. edge node) miners can join the Flowchain mining pool to broadcast puzzles to IoT devices. The flowchain-hybrid app is built upon [flowchain-ledger](https://github.com/flowchain/flowchain-ledger), the distributed ledger technloogy by Flowchain. Please read [Flowchain](https://flowchain.co) for more information.

# Prerequisite

For MacOS users:

* Command Line Tools for Xcode - Run ```xcode-select --install``` for installation
* Node.js 8+

For Ubuntu users:

* Ubuntu 16.04 or above
* Build-essential package - Run ```sudo apt-get install build-essential``` for installation
* Node 8+

# How to Use

## Use Flowchain testnet

Start the ```index.js``` Flowchain node:

```
$ node index.js
[Verbose 15:02:10] P2P/Chord/node id = 69a3e9ec2138e70f78abeeb964d50b9512b7e959
[Verbose 15:02:10] P2P/Chord/successor = {"address":"localhost","port":8000,"id":"69a3e9ec2138e70f78abeeb964d50b9512b7e959"}
[Flowchain/IPFS 15:02:11] Hybrid
[Flowchain/IPFS 15:02:11] Flowchain-ledger
[Verbose 15:02:11] flowchain-hybrid 0.2.0/----- Genesis Block -----
[Verbose 15:02:11] flowchain-hybrid 0.2.0/{"hash":"dd0e2b79d79be0dfca96b4ad9ac85600097506f06f52bb74f769e02fcc66dec6","previousHash":"0000000000000000000000000000000000000000000000000000000000000000","timestamp":"2018-12-09T15:02:10.047Z","merkleRoot":{},"difficulty":"0FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF","nonce":0,"no":0}
[Verbose 15:02:11] flowchain-hybrid 0.2.0/----- Start mining -----
[flowchain 15:02:11] Connect to testnet.pool.flowchain.io:3333
[Flowchain/IPFS 15:02:11] Hybrid
[flowchain 15:02:11] Hybrid node API server started on
[flowchain-hybrid 0.2.0 15:02:11] node is running at ws://localhost:8000
[flowchain 15:02:11] Connected to server
[Verbose 15:02:13] P2P/Debug/onNewThing: [object Object]
[flowchain 15:02:13] Block 1 found 0x0121ee9185bcb61cd92efa058e884687d0f355463f775139fe746fc5ecace07b
[P2P/Chord 15:02:13] successor_ttl = 6
[P2P/Chord 15:02:15] predecessor_ttl = 6
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

# Roadmap

Flowchain team is working on the "v1.0" public beta which we will launch along with the Flowchain public testnet. During the v1.0 development, the Flowchain project will open source by five stages.

* v0.2: functional tests, implementation to the proposed architecture and virtual blocks technique
* v0.4: specs and protocols v1.0
* v0.6: security auditing and code-refactor
* v0.8: performance improvements
* v1.0: prepare for the main net

# Bibliography

This work is based on the research papers.

[1] Jollen Chen. 2018. Devify: decentralized internet of things software framework for a peer-to-peer and interoperable IoT device. SIGBED Rev. 15, 2 (June 2018), 31-36. DOI: [https://doi.org/10.1145/3231535.3231539](https://doi.org/10.1145/3231535.3231539)

[2] Jollen Chen. 2018. Hybrid blockchain and pseudonymous authentication for secure and trusted IoT networks. SIGBED Rev. 15, 5 (November 2018), 22-28. DOI: [https://doi.org/10.1145/3292384.3292388](https://doi.org/10.1145/3292384.3292388)

## How to Cite

```
@article{Chen:2018:DDI:3231535.3231539,
 author = {Chen, Jollen},
 title = {Devify: Decentralized Internet of Things Software Framework for a Peer-to-peer and Interoperable IoT Device},
 journal = {SIGBED Rev.},
 issue_date = {March 2018},
 volume = {15},
 number = {2},
 month = jun,
 year = {2018},
 issn = {1551-3688},
 pages = {31--36},
 numpages = {6},
 url = {http://doi.acm.org/10.1145/3231535.3231539},
 doi = {10.1145/3231535.3231539},
 acmid = {3231539},
 publisher = {ACM},
 address = {New York, NY, USA},
 keywords = {decentralized, flow-based programming, internet of things, interoperability, peer-to-peer, web of things},
}

@article{Chen:2018:HBP:3292384.3292388,
 author = {Chen, Jollen},
 title = {Hybrid Blockchain and Pseudonymous Authentication for Secure and Trusted IoT Networks},
 journal = {SIGBED Rev.},
 issue_date = {October 2018},
 volume = {15},
 number = {5},
 month = nov,
 year = {2018},
 issn = {1551-3688},
 pages = {22--28},
 numpages = {7},
 url = {http://doi.acm.org/10.1145/3292384.3292388},
 doi = {10.1145/3292384.3292388},
 acmid = {3292388},
 publisher = {ACM},
 address = {New York, NY, USA},
 keywords = {blockchain, decentralized, hybrid consensus, internet of things, peer-to-peer, trustless computing},
} 
```

# License

Copyright (C) 2018 [Jollen Chen](https://github.com/jollen). The source code is licensed under the MIT license found in the [LICENSE](LICENSE) file.
