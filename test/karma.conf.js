module.exports = function(config){
  config.set({
    preprocessors: {
      '**/*.coffee': ['coffee']
    },
    basePath : '../',
    files : [
      'bower_components/escodegen/escodegen.browser.js',
      'velato.js',
      'test/**/*.coffee'
    ],
    frameworks: ['jasmine'],
    plugins : [
      'karma-coffee-preprocessor',
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ],
    coffeePreprocessor: {
      options: {
        sourceMap: false
      },
      transformPath: function(path) {
        return path.replace(/\.coffee$/, '.js');
      }
    }
  });
};
