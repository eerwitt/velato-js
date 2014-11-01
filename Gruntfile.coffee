module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    connect:
      server:
        options:
          port: 8000
          base: './'
    coffee:
      compile:
        files:
          'velato.js': ['velato/**/*.coffee']
    watch:
      karma:
        files: ['velato.js']
        tasks: ['karma:unit:run']
      coffee:
        options:
          livereload: true
          debounceDelay: 8000
        files: ['index.html', 'velato/**/*.coffee']
        tasks: ['coffee']
    concurrent:
      options:
        logConcurrentOutput: true
      target:
        tasks: ['watch', 'karma:unit:start']
    karma:
      options:
        configFile: 'test/karma.conf.js'
        browsers: ['PhantomJS']
      unit:
        reporters: 'dots'
        singleRun: false
        autoWatch: true

  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-concurrent'
  grunt.loadNpmTasks 'grunt-karma'

  grunt.registerTask 'default', ['connect', 'concurrent:target']
