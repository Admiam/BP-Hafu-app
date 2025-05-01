// babel.config.js   (SDK 50, Babel 8)
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],          // global plugins (run everywhere)

    // run inline-dotenv **only** on app code, not node_modules
    overrides: [
      {
        test: ['./app', './lib'],           // adjust to your folders
        plugins: ['inline-dotenv'],         // no options needed
      },
    ],
  };
};
