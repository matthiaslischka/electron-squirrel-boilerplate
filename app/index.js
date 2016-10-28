/**
 * Created by ramor11 on 10/26/2016.
 */
'use strict';

if (require('electron-squirrel-startup')) return;

const pkg = require('../package.json');
const fs = require('fs');
const path = require('path');
const util = require('util');

const appVersion = pkg.version;
const updateFeed = ["http://localhost:9000/updates/latest/", "?v=", appVersion].join("");


const args = require('./args');
const squirrel = require('./squirrel');


// prevent window being GC'd
const DOWNLOAD_DIR = path.join(process.env.USERPROFILE, 'Downloads');
const log_file = fs.existsSync(DOWNLOAD_DIR) ?
    fs.createWriteStream(path.join(DOWNLOAD_DIR, 'phoenix_debugger.log'), {flags: 'w'}) : fs.createWriteStream(path.join(ELECTON_REPO, 'phoenix_debugger.log'));

const log_stdout = process.stdout;

console.log = function () { //
    var args = [],
        d = new Date(),
        timeStamp = "\[" + String(d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + ":" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()) + "\]:";

    args.push(timeStamp);

    for (var i in arguments) {
        args.push(util.format(arguments[i]));
    }
    log_file.write(args.join(" ") + '\n');
    log_stdout.write(args.join(" ") + '\n');
};

/***********************************************************************************************************************************************
 * START OF THE FUN
 **********************************************************************************************************************************************/



// Module to control application life.
const {app, remote, BrowserWindow, ipcMain, autoUpdater, electronScreen, Menu} = require('electron');


app.commandLine.appendSwitch('remote-debugging-port', '32400');

/***********************************************************************************************************************************************
 * START OF THE MAIN PROCESS TO CHECK FOR VERSION
 **********************************************************************************************************************************************/

app.checkVersion = function () {
    autoUpdater.checkForUpdates();
};

autoUpdater.setFeedURL(updateFeed);
require('./auto-updator')(autoUpdater);

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            app.quit();
            return true;
    }
};

/***********************************************************************************************************************************************
 * START OF THE RENDERING PROCESS
 **********************************************************************************************************************************************/


/**
 * Create the main Electron Application
 */
var mainWindow = null;
var updater = require('electron-updater')

app.on('ready', function() {
    updater.on('ready', function () {
        mainWindow = new BrowserWindow({width: 800, height: 600})
        mainWindow.loadURL(`file://${__dirname}/index.html`);
        mainWindow.openDevTools({detach:true})
        mainWindow.on('closed', function() {
            mainWindow = null;
        })
    })
    updater.on('updateRequired', function () {
        app.quit();
    })
    updater.on('updateAvailable', function () {
        mainWindow.webContents.send('update-available');
    })
    updater.start()
})

// function createMainWindow() {
//
//     let params = {
//         icon: path.join(__dirname, 'icon.ico'),
//         title: app.getName()
//     };
//
//     mainWindow = new BrowserWindow(params);
//     mainWindow.loadURL(`file://${__dirname}/index.html`);
//     mainWindow.on('closed', function () {
//         mainWindow = null;
//     });
//
//
// }
//
// function startMainApplication() {
//     const {app, Menu} = require('electron')
//
//     const template = [
//         {
//             label: 'About',
//             submenu: [
//                 {
//                     label: 'Check for Updates ',
//                     role: 'Check for Updates ',
//                     click (item, focusedWindow) {
//                         app.checkVersion()
//                     }
//                 }
//             ]
//         }
//     ];
//
//
//     const menu = Menu.buildFromTemplate(template)
//     Menu.setApplicationMenu(menu)
//
//     if (fs.existsSync(path.resolve(path.dirname(process.execPath), '..', 'update.exe')))app.checkVersion();
//     createMainWindow();
// }
//
