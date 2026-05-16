const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolve @/ alias to project root
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
};

module.exports = config;
