var WorkObject = function() {
    this.coin = 'ETH';

    // `STRATUM_PROTOCOL_ETHPROXY`
    this.sHeaderHash = '';
    this.sSeedHash = '';
    this.sShareTarget = '';

   return this;
};

module.exports = WorkObject;
