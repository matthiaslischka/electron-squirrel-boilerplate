var fs = require('fs'),
    path = require('path'),
    utilities = require('./app/libs/utilities.js');


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
    var config = require("./electron.config.js");
    var appConfig = {
        app: 'app',
        dist: 'build',
    };

    require('./scripts/build_asar.js')(grunt);
    require('./scripts/build_wxs.js')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), // Project settings
        yeoman: appConfig, // Watches files for changes and runs tasks based on the changed files
        electronConfig: config, // Watches files for changes and runs tasks based on the changed files
        clean: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'build',
                    extDot: 'last',
                    src: ['**.wixobj', '**.wixpdb']
                }]
            },
            asar: {
                files: [{
                    expand: true,
                    cwd: '<%= electronConfig.electron_build %>',
                    src: ['resources/app.asar']
                }]
            }
        },
        exec: {
            'candle': {
                cmd: function () {
                    var files = getFilesPath('wxs', 'wixobj'),
                        command = ['"' + path.join(__dirname, 'staging', 'candle.exe') + '"',
                            '-ext "C:\\Program Files (x86)\\WiX Toolset v3.9\\bin\\WixUtilExtension.dll"',
                            files[0] + ' -o ' + files[1]
                        ].join(" ");

                    return command;
                }
            },
            'light': {
                cmd: function () {
                    var files = getFilesPath('wixobj', 'msi'),
                        command = ['"' + path.join(__dirname, 'staging', 'light.exe') + '"',
                            '-ext "C:\\Program Files (x86)\\WiX Toolset v3.9\\bin\\WixUtilExtension.dll"',
                            files[0] + ' -o ' + files[1]
                        ].join(" ");

                    return command;
                }
            }
        }
    });


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
        'candle', ['exec:candle']
    );

    grunt.registerTask(
        'light', [
            'exec:light',
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