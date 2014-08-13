var chalk = require('chalk');

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		dirs: {
			build: 'build',
			test: 'tests'
		},

		browserify: {
			web: {
				browserifyOptions: {
					standalone: 'tamarack'
				},
				src: [ 'index.js' ],
				dest: '<%= dirs.build %>/tamarack.js'
			},
			browserTests: {
				src: [ '<%= dirs.test %>/pipeline-tests.js' ],
				dest: '<%= dirs.test %>/pipeline-tests_browser.js'
			}
		},

		uglify: {
			web: {
				src: [ '<%= dirs.build %>/tamarack.js' ],
				dest: '<%= dirs.build %>/tamarack.min.js'
			}
		},

		// node tests
		mochacov: {
			test: {
				options: {
					reporter: 'spec',
					require: [ 'should' ]
				}
			},
			coverage: {
				options: {
					reporter: 'html-cov',
					require: [ 'should' ],
					output: '<%= dirs.build %>/coverage.html'
				}
			},
			options: {
				files: '<%= dirs.test %>/pipeline-tests.js'
			}
		},

		// browser tests
		mocha: {
			browser: {
				src: [ '<%= dirs.test %>/pipeline-tests.html' ],
				options: {
					log: true,
					logErrors: true,
					reporter: 'Spec',
					run: true
				}
			}
		},

		clean: [ 'build' ],

		copy: {
			release: {
				src: '<%= dirs.build %>/tamarack.min.js',
				dest: 'tamarack.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-mocha-cov');
	grunt.loadNpmTasks('grunt-mocha');
	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('test', [ 'browserify:browserTests', 'mochacov:test', 'mocha:browser' ]);
	grunt.registerTask('coverage', 'Calculate test coverage', function() {
		grunt.task.run('mochacov:coverage');
		grunt.log.writeln('Results in ' + chalk.cyan(grunt.config.get('dirs.build') + '/coverage.html'));
	});
	grunt.registerTask('build', [ 'test', 'browserify:web', 'uglify:web' ]);
	grunt.registerTask('default', [ 'build' ]);
	grunt.registerTask('bump', 'Bump version number', function() {
		var pkg = require('./package.json'),
			oldVersion = pkg.version,
			versions = pkg.version.split('+'),
			parts = versions[0].split('.');

		parts.push(parseInt(parts.pop()) + 1);
		pkg.version = parts.join('.') + '+' + versions[1];

		grunt.log.write('Bumping version to ' + chalk.green(pkg.version) + ' (old was ' + chalk.yellow(oldVersion) + ')');
		grunt.file.write('./package.json', JSON.stringify(pkg, null, '\t'));
		grunt.log.writeln();
	});

	grunt.registerTask('release', 'Prepares release build', function() {
		grunt.task.run([ 'build', 'copy:release', 'bump' ]);
	});
};