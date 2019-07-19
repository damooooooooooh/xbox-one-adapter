'use strict';

const XboxOneAdapter = require('./lib/xbox-one-adapter');

module.exports = (addonManager, manifest) => {
  const config = manifest.moziot.config;

  new XboxOneAdapter(addonManager, manifest);
};
