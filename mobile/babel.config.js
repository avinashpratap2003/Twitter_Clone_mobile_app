module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        { jsxImportSource: 'nativewind' },
      ],
      '@babel/preset-typescript',
      'nativewind/babel',
    ],
  };
};
