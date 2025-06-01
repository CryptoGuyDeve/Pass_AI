const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  stream: require.resolve('readable-stream'),
  crypto: require.resolve('react-native-crypto'),
  buffer: require.resolve('@craftzdog/react-native-buffer'),
  util: require.resolve('util'),
  process: require.resolve('process/browser'),
};

module.exports = config; 