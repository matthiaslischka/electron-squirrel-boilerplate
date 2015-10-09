var fs = require('fs'),
    path = require('path');

'use strict';
module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(
        grunt, {
            config: 'package.json',
            scope: [
                'devDependencies',
                'dependencies'
            ]
        }
    );

    var appConfig = {
        app: 'app',
        dist: 'dist',
    };

    // Define the configuration for all the tasks
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), // Project settings
        yeoman: appConfig, // Watches files for changes and runs tasks based on the changed files
        clean: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'build',
                    extDot: 'last',
                    src: ['**.wixobj', '**.wixpdb']
                }]
            }
        },
        execute: {
            'build-asar': {
                src: ['build_asar.js']
            },
            'build-wxs': {
                src: ['build_wxs.js']
            }
        },
        exec: {
            'candle': {
                cmd: function () {
                    var files = getFilesPath('wxs', 'wixobj');
                    return 'candle.exe ' + files[0] + ' -o ' + files[1];
                }
            },
            'light': {
                cmd: function () {
                    var files = getFilesPath('wixobj', 'msi');
                    return 'light.exe ' + files[0] + ' -o ' + files[1];
                }
            }
        }
    });


    function validate() {
        var config = require("./electron.config.js");
        var APP_VERSION = String(config.version).trim() || false;
        var BUILD_DESTINATION = path.join(__dirname, config.distribution);
        var BUILD_FILE = false;
        try {
            BUILD_FILE = fs.existsSync(BUILD_DESTINATION) ? require(path.join(BUILD_DESTINATION, 'build.json')) : require('build.json');
        } catch (e) {
        }

        var BUILD_VERSION = String(BUILD_FILE.version).trim() || false;

        return BUILD_VERSION !== APP_VERSION;
    }

    function getFilesPath(input, output) {
        var config = require("./electron.config.js"),
            APP_VERSION = config.version,
            BUILD_DESTINATION = path.join(__dirname, config.distribution),
            READ_FILE = 'v' + APP_VERSION + '.' + input,
            FILE_DESTINATION = 'v' + APP_VERSION + '.' + output;

        if (fs.existsSync(BUILD_DESTINATION)) {
            READ_FILE = path.join(BUILD_DESTINATION, READ_FILE);
            FILE_DESTINATION = path.join(BUILD_DESTINATION, FILE_DESTINATION);
        }

        return [READ_FILE, FILE_DESTINATION]
    }


    grunt.registerTask(
        'electron-build', [
            'execute:build-asar'
        ]
    );

    grunt.registerTask(
        'msi-build', [
            'execute:build-wxs',
            //'exec:candle',
            //'exec:light',
            //'clean:build'

        ]
    );

    grunt.registerTask(
        'build', [
             'electron-build'
        ]
    );
    grunt.registerTask(
        'default', ['build']
    );
};