module.exports = {
    presets: ['babel-preset-expo'],  // Or 'react-native' if you're not using Expo
    env: {
      test: {
        plugins: ['@babel/plugin-transform-runtime'],
      },
    },
  };
  