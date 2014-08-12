var chalk = require('chalk');

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		browserify: {
			web: {
				browserifyOptions: {
					standalone: 'tamarack'
				},
				src: [ 'index.js' ],
				dest: 'build/tamarack.js'
			}
		},

		uglify: {
			web: {
				src: [ 'build/tamarack.js' ],
				dest: 'build/tamarack.min.js'
			}
		},

		mochaTest: {
			test: {
				options: {
					reporter: 'spec'
				},
				src: [ 'tests/*.js' ]
			}
		},

		clean: [ 'build' ],

		copy: {
			release: {
				src: 'build/tamarack.min.js',
				dest: './tamarack.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('test', [ 'mochaTest:test' ]);
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