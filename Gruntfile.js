'use strict';

module.exports = function(grunt) {
	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			js: {
				files: [
					'Gruntfile.js',
					'*.js',
					'!*.swp',
					'_assets/js/**'
				],
				tasks: ['jshint', 'uglify:scripts'],
				options: {
					livereload: true,
				},
			},
			img: {
				files: [
					'_assets/img/**'
				],
				tasks: ['imagemin'],
				options: {
					livereload: true,
				},
			},
			jst: {
				options: {
					templateSettings: {
						variable: 'data'
					}
				},
				files: [
					'!*.swp',
					'_assets/templates/**/*.ejs'
				],
				tasks: ['jst']
			},
			less: {
				files: [
					'!*.swp',
					'_assets/less/*.less'
				],
				tasks: ['less'],
				options: {
					livereload: true
				}
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			all: [
				'Gruntfile.js',
				'*.js',
				'_assets/js/**'
			]
		},
		jst: {
			compile: {
				options: {
					templateSettings: {
						variable: 'data'
					}
				},
				files: {
					'assets/js/templates.js': ['_assets/templates/**/*.ejs']
				}
			}
		},
		less: {
			dist: {
				files: {
					'assets/css/main.min.css': [
						'_assets/less/app.less'
					]
				},
				options: {
					compress: true,
					outputSourceFiles: true,
					sourceMap: true,
					sourceMapBasepath: '../../',
					sourceMapFilename: 'assets/css/main.min.css.map',
					sourceMapURL: 'main.min.css.map'
				}
			}
		},
		uglify: {
			vendor: {
				files: {
					'assets/js/vendor.min.js': [
						'_assets/bower_components/jquery/dist/jquery.js',
						'_assets/bower_components/underscore/underscore.js'
					]
				},
				options: {
					sourceMap: true,
					sourceMapIncludeSources: true,
					sourceMapName: 'assets/js/vendor.min.js.map'
				}
			},
			scripts: {
				files: {
					'assets/js/scripts.min.js': [
						'_assets/js/app.js'
					]
				},
				options: {
					sourceMap: true,
					sourceMapIncludeSources: true,
					sourceMapName: 'assets/js/scripts.min.js.map'
				}
			}
		},
		imagemin: {
			dist: {
				options: {
					interlaced: true,
					optimizationLevel: 7,
					pngquant: true,
					progressive: true
				},
				files: [{
					expand: true,
					cwd: '_assets/img/',
					src: [
						'**/*.*',
						'!**/Thumbs.db',
						'!**/.DS_Store',
					],
					dest: 'assets/img/'
				}]
			}
		},
		copy: {
			fonts: {
				expand: true,
				flatten: true,
				src: [
					'_assets/bower_components/font-awesome/fonts/*',
				],
				dest: 'assets/fonts/'
			}
		},
		jekyll: {
			dist: {
				options: {
					config: '_config.yml'
				}
			}
		}
	});

	//Load NPM tasks
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-jekyll');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jst');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	//Making grunt default to force in order not to break the project.
	grunt.option('force', true);

	grunt.registerTask('createDefaultTemplate', function () {
		grunt.file.write('js/templates.js', 'this.JST = this.JST || {};');
	});

	//Default task(s).
	grunt.registerTask('default', [
		'less',
		'createDefaultTemplate',
		'jst',
		'uglify:vendor',
		'uglify:scripts',
		'imagemin',
		'copy:fonts'
	]);

	grunt.registerTask('dev', [
		'default',
		'watch'
	]);

	grunt.registerTask('build', [
		'default',
		'jekyll'
	]);
};
