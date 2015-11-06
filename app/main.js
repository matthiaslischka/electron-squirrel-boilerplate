'use strict';

const BrowserWindow = require('browser-window');
const Menu = require('menu');
const angular = require('./ng-electron/ng-bridge');
const path = require('path');
const ipc = require('ipc');
const app = require('app');
const http = require("https");
const fs = require('fs');
const dialog = require('dialog');
const version = require('./version.json');
const MenuItem = require('menu-item');
const utilities = require('./utilities');
const code = fs.readFileSync(__dirname + '/ng-electron/ng-electron-promise.min.js', 'utf8');

//GET THE ENVIRONMENT VARIABLES TO CREATE
const release = version["DEV"] + path.join(version.releasePath, version["WORKING_ENVIRONMENT"].toLowerCase(), 'build.json').replace(/\\/g, '/');
const webUrl = version[version["WORKING_ENVIRONMENT"]] + "web-ui/";


// prevent window being GC'd
let mainWindow = null;
let splashScreen = null;

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
function getVersion(callback) {
    http.get(release, function (res) {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function () {
            var obj = JSON.parse(output);
            callback(res.statusCode, obj);
        });

    }).on('error', function (e) {
        callback(e);
    });
}


function createMainWindow(size) {
    const win = new BrowserWindow({
        width: size.width,
        height: size.height,
        resizable: true,
        show: false,
        icon: path.join(__dirname, 'icon.ico'),
        title: 'LabCorp Phoenix',
        //'web-preferences':{
        //    'web-security':false,
        //    'allow-displaying-insecure-content':true,
        //    'allow-running-insecure-content':true
        //}
    });

    console.log('webUrl',webUrl)

    win.loadUrl(webUrl);

    win.on('closed', function () {
        mainWindow = null;
    });

    return win;
}


/**
 * Create the main Electron Application
 */
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
}).on('activate-with-no-open-windows', function () {
    if (!mainWindow) {
        LOAD_APPLICATION();
    }
}).on('will-quit', function () {
    console.log('<====================================>');
    console.log('Goodbye');
}).on('ready', LOAD_APPLICATION);


function LOAD_APPLICATION() {
    var electronScreen = require('screen');
    var size = electronScreen.getPrimaryDisplay().workAreaSize;


    /**
     * Build the Splash Screen
     */
    splashScreen = new BrowserWindow({
        width: 602,
        height: 502,
        resizable: false,
        transparent: true,
        frame: false,
        'always-on-top': true
    });
    splashScreen.loadUrl('file://' + __dirname + '/dialogs/spash-screen.html?');
    splashScreen.on('closed', function () {
        splashScreen = null;
    })

    /**
     * Once the Splash Screen finish loading, check the version, start to load the application
     * in the background
     */
    splashScreen.webContents.on('did-finish-load', function (e) {

        if (!mainWindow) {
            startMainApplication();
        }

        setTimeout(function () {
            getVersion(function (status, obj) {
                var vrsCompare = utilities.versionCompare(obj.version, version.version);
                if (vrsCompare > 0) {
                    var download = new BrowserWindow({
                        width: 402,
                        height: 152,
                        resizable: false,
                        frame: false,
                        'always-on-top': true
                    });
                    download.loadUrl('file://' + __dirname + '/dialogs/download.html?version=' + obj.version + '&id=' + mainWindow.id);
                    download.on('closed', function () {
                        download = null;
                        download.destroy();
                    });
                 }
            });

        }, 500);
    });




    function startMainApplication() {
        mainWindow = createMainWindow(size);

        mainWindow.webContents.on('did-start-loading', function (e) {
            //var insertScript = 'var s = document.querySelector( \'.message\' );s.innerHTML="Loading ...";';
            //splashScreen.webContents.executeJavaScript(insertScript);
        });

        mainWindow.webContents.on('did-fail-load', function (e) {
            var insertScript = 'stop();';
            splashScreen.webContents.executeJavaScript(insertScript);

            console.log('did-fail-load')
        });

        mainWindow.webContents.on('did-stop-loading', function (e) {

            var insertScript = 'var s = document.createElement( \'script\' );var newContent = document.createTextNode(\'' + code + '\');s.appendChild(newContent);document.body.appendChild( s );';
            mainWindow.webContents.executeJavaScript(insertScript);
            mainWindow.webContents.executeJavaScript("document.documentElement.setAttribute('id','ELECTRON_PARENT_CONTAINER');");

            console.log('did-stop-loading')

        });

        mainWindow.webContents.on('dom-ready', function (e) {
            //var insertScript = 'var s = document.querySelector( \'.message\' );s.innerHTML="Completed";';
            if(splashScreen)
                splashScreen.webContents.executeJavaScript('setTimeout(complete,1000);');

           var bootstrap =  setTimeout(function () {
                mainWindow.webContents.executeJavaScript("angular.bootstrap(document, ['phxApp']);");
            }, 1000);

            setTimeout(function () {
                clearTimeout(bootstrap);

                if(splashScreen)
                    splashScreen.close();//no longer needed
                mainWindow.show();//no longer needed
            }, 2000);
        });

        //open the developer tools
        //mainWindow.openDevTools();
        mainWindow.webContents.on('did-finish-load', function (e) {
            angular.listen(function (data) {

                switch (data.eventType) {
                    case 'getVersion':
                        getVersion(function (status, obj) {
                            data.msg.version = obj;
                            angular.send(data);
                        });
                        break;
                    default :
                        angular.send(data);
                        break;

                }

            });
        });

    }
}


