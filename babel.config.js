const envFile = process.env.APP_ENV === 'production' ? '.env.production' : '.env.local';

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: envFile,
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};
