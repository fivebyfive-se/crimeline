const sass = require('node-sass');

module.exports = (grunt) => {
    require('load-grunt-tasks')(grunt);

    const watchOptions = {
        debounceDelay: 250,
        spawn: false,
    };

    grunt.initConfig({
        copy: {
            main: {
                files: [
                    { expand: true, src: ['**'], dest: 'public/', cwd: 'client/static/' },
                ]
            }
        },
        babel: {
            options: {
                sourceMap: true,
                minified: false,
                presets: ['@babel/preset-env']
            },
            dist: {
                files: {
                    'public/js/timeline.js': 'client/src/js/timeline.js',
                }
            }
        },
        sass: {
            options: {
                implementation: sass,
                sourceMap: true
            },
            dist: {
                files: {
                    'public/css/critical.css': 'client/src/scss/critical.scss',
                    'public/css/non-critical.css': 'client/src/scss/non-critical.scss',
                }
            }
        },
        watch: {
            static: {
                files: ['client/static/**/*.*'],
                tasks: ['copy'],
                options: watchOptions
            },
            scripts: {
                files: ['client/src/**/*.js'],
                tasks: ['babel'],
                options: watchOptions,
            },
            style: {
                files: ['client/src/**/*.scss'],
                tasks: ['sass'],
                options: watchOptions,
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('build', ['babel', 'sass', 'copy']);
    grunt.registerTask('dev', ['build', 'watch']);
    grunt.registerTask('default', ['build']);
};