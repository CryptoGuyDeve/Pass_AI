module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            stream: 'readable-stream',
            crypto: 'react-native-crypto',
            buffer: '@craftzdog/react-native-buffer',
            util: 'util',
            process: 'process/browser',
          },
        },
      ],
    ],
  };
}; 