module.exports = function(config) {
  if (!config.servers) {
    throw new Error('[servers] required');
  }
};
