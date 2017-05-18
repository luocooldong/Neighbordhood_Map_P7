'use strict';

module.exports = function (grunt) {
    // Time how long tasks take. Can help when optimizing build times
require('time-grunt')(grunt);

// Automatically load required Grunt tasks
require('jit-grunt')(grunt);
 
    
require('jit-grunt')(grunt, {
  useminPrepare: 'grunt-usemin'
});    

// Define the configuration for all the tasks
grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    //useminPrepare
    useminPrepare: {
      html: 'src/index.html',
      options: {
        dest: 'dist'
      }
    },
    
    // Concat
    concat: {
      options: {
        separator: ';'
      },
      // dist configuration is provided by useminPrepare
      dist: {}
    },
    
    // Uglify
    uglify: {
      // dist configuration is provided by useminPrepare
      dist: {}
    },
    
    // cssmin
    cssmin: {
      dist: {}
		
    },
    
    // Filerev
    filerev: {
      options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 20
      },
      release: {
        files: [{
          src: [
            'dist/js/*.js',
            'dist/css/*.css',
          ]
        }]
      }
    },

    usemin: {
      html: ['dist/*.html'],
      css: ['dist/css/*.css'],
      options: {
        assetsDirs: ['dist', 'dist/css']
      }
    },

    copy: {
        dist: {
            cwd: 'src',
            src: ['**', 'css/**/*.css', 'js/**/*.js'],
            dest: 'dist',
            expand: true
        },
		css:{
			files: [
                {
                    expand: true,
                    dot: true,
                    cwd: 'bower_components/bootstrap/dist',
                    src: ['css/bootstrap.min.css'],
                    dest: 'dist'
              }, {
                    expand: true,
                    dot: true,
                    cwd: 'bower_components/font-awesome',
                    src: ['css/font-awesome.min.css'],
                    dest: 'dist'
              }
            ]
		},
        fonts: {
            files: [
                {
                    //for bootstrap fonts
                    expand: true,
                    dot: true,
                    cwd: 'bower_components/bootstrap/dist',
                    src: ['fonts/*.*'],
                    dest: 'dist'
              }, {
                    //for font-awesome
                    expand: true,
                    dot: true,
                    cwd: 'bower_components/font-awesome',
                    src: ['fonts/*.*'],
                    dest: 'dist'
              }
            ]
        }
    },
	
	processhtml: {
        views: {
            files: {
				'dist/index.html': ['dist/index.html']
            }
        }
    },
    
   watch: {
      copy: {
        files: [ 'src/**', '!src/**/*.css', '!src/**/*.js'],
        tasks: [ 'build' ]
      },

      js: {
        files: ['src/js/main.js'],
        tasks:[ 'build']
      },

      css: {
        files: ['src/css/main.css'],
        tasks:['build']
      },

      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },

        files: [
          'src/{,*/}*.html'
        ]
      }
    },

    connect: {
      options: {
        port: 9000,
        hostname: 'localhost',
        livereload: 35729
      },
      dist: {
        options: {
          open: true,
          base:{
            path: 'dist',
            options: {
              index: 'index.html',
              maxAge: 300000
            }
          }
        }
      }
    },
    clean: {
        build: {
            src: ['dist/']
        }
    }
});

grunt.registerTask('build', [
     'clean',
     'useminPrepare',
     'concat',
     'cssmin',
     'uglify',
     'copy',
//     'filerev',
     'usemin',
	 'processhtml'//可以把js文件生成放入html中
]);
    
grunt.registerTask('serve',['build','connect:dist','watch']);    

grunt.registerTask('default',['build']);
    
};