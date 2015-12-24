module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['app/**/*.js'],
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