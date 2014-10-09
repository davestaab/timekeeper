module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['bower_components/angular/angular.js', 'bower_components/angular-route/angular-route.js', 'bower_components/d3/d3.js', 'app/**/*.js', 'src/*.js'],
        dest: 'dist/app.js'
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'app/scripts/**/*.js', 'src/*.js']
    },
    watch: {
      src: {
        files: ['src/*.js', 'app/**/*.js'],
        tasks: ['jshint', 'concat']  
      }
      
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat']);

};