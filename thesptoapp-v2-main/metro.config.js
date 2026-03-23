const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Use polling-based file watcher to work around OneDrive filesystem issues
config.watcher = {
  ...config.watcher,
  watchman: {
    deferStates: [],
  },
  additionalExts: config.watcher?.additionalExts || [],
};

// Force Node's fs.watch polling to avoid native watcher issues on OneDrive
config.watcher.healthCheck = {
  enabled: false,
};

module.exports = config;
