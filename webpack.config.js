module.exports = {
  entry: './index.js',
  output: {
    path: __dirname,
    libraryTarget: "commonjs2",
    filename: 'dist.js'
  },
  externals: {
    request: true,
    sugar: true,
  },
  target: 'node'
};