const path = require('path');

module.exports = {
  entry: ['./assets/js/3D.js'],
  mode: 'development',
  experiments: {
    outputModule: true
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    module: true
  }
};
