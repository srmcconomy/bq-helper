// @flow

module.exports = {
  ports: {
    webpack: 8080,
    express: 3000
  },
  build: {
    babel: {
      presets: ['env', 'react'],
      plugins: ['transform-class-properties', 'transform-object-rest-spread'],
    },
    sass: {
      style: 'compact',
      includePaths: ['./assets/css', './node_modules'],
    },
    autoprefixer: {
      browsers: ['> 5%'],
    }
  },
  files: {
    client: {
      entry: './src/client.jsx',
      src: './src/**/**/*.js?(x)',
      out: 'js',
      outFile: 'bundle.js'
    },
    server: {
      src: './src/**/**/*.js?(x)',
      out: 'build'
    },
    css: {
      entry: './assets/scss/main.scss',
      src: './assets/scss/**/**/*.scss',
      out: 'css',
    },
    staticAssets: 'build/static/'
  }
};
