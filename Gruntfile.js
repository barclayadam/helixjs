module.exports = function (grunt) {
    var rigger = require('rigger'),
        path = require('path');

    var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

    var folderMount = function folderMount(connect, point) {
        return connect.static(path.resolve(point));
    };

    var saucekey = null;

    if (typeof process.env["SAUCE_ACCESS_KEY"] !== "undefined") {
        saucekey = process.env["SAUCE_ACCESS_KEY"];
    }

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-livereload');
    grunt.loadNpmTasks('grunt-regarde');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.loadNpmTasks('grunt-saucelabs');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        meta: {
            banner: '/*!\n' + 
                    ' <%= pkg.name %> - v<%= pkg.version %>\n' +
                    ' Copyright (c) <%= grunt.template.today("yyyy") %> Adam Barclay.\n' + 
                    ' Distributed under MIT license\n' + 
                    ' http://github.com/barclayadam/HelixJS\n' +
                    '*/\n'
        },

        uglify: {
            options: {
                banner: '<%= meta.banner %>',

                sourceMap: 'lib/hx.min.sourcemap.js',
            },

            build: {
                files: {
                    'lib/hx.min.js': ['lib/hx.js']
                }
            }
        },

        connect: {
            livereload: {
                options: {
                    port: 9001,

                    middleware: function (connect, options) {
                        return [lrSnippet, folderMount(connect, '.')]
                    }
                }
            }
        },

        regarde: {
            serve: {
                files: ['src/**/*.*', 'spec/**/*.*'],
                tasks: ['build', 'livereload']
            }
        },

        'saucelabs-jasmine': {
            all: {
                username: 'barclayadam', // if not provided it'll default to ENV SAUCE_USERNAME (if applicable)
                key: saucekey,

                urls: ['http://localhost:9001/spec/runner.html'],

                concurrency: '3',

                testTimeout: 35000,
                testInterval: 1500,

                testname: 'HelixJS test suite',

                browsers: [
                    { browserName: 'chrome', platform: 'Windows 2008' }, 
                    { browserName: 'chrome', platform: 'Windows 2003' }, 
                    { browserName: 'chrome', platform: 'Linux' }, 
                    { browserName: 'chrome', platform: 'Mac 10.8' }, 

                    { browserName: 'internet explorer', version: 9, platform: "Windows 2008" }, 
                    { browserName: 'internet explorer', version: 10, platform: "Windows 2012" }, 

                    { browserName: 'firefox', platform: "Windows 2008" }, 
                    { browserName: 'firefox', platform: "Linux" }, 
                    { browserName: 'firefox', platform: "Mac 10.6" }

                    // TODO: Fix in this combination  { browserName: 'internet explorer', version: 8, platform: "Windows 2008" },
                    // TODO: Having connection issues { browserName: 'opera', platform: "Windows 2008" }
                ]
            }
        }
    });

    grunt.registerTask('rig', 'Compile files using rigger', function () {
        var inPath = 'src/hx.js',
            outPath = 'lib/hxs.js',
            done = this.async();

        rigger.process(grunt.file.read(inPath), {
            cwd: path.resolve(path.dirname(inPath)),
            separator: grunt.util.linefeed
        }, function (_, output, settings) {
            grunt.file.write(outPath, output, {
                encoding: 'utf8'
            });

            done();
        });
    });

    grunt.registerTask('build', ['rig', 'uglify']);
    grunt.registerTask('serve', ['livereload-start', 'connect']);

    if (saucekey) {
        grunt.registerTask('test', ['serve', 'saucelabs-jasmine']);
    } else {
        grunt.registerTask('test', ['serve']);
    }

    grunt.registerTask('default', ['serve', 'regarde']);
};