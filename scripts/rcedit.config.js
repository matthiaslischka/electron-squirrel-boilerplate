var path = require('path'),
    config = require("../electron.config.js"),
    package = require("../package.json");

config['build_date'] = new Date().toJSON();


const APP_NAME = config.app_name ;
const APP_DESCRIPTION = config.app_description;
const MANUFACTURER = config.manufacturer;
const APP_VERSION = String(config.version).trim() || false;
const APPLICATION_SRC = path.join(path.dirname(__dirname), config.source);



module.exports = {
    'versionString': {
        'CompanyName': APP_NAME,
        'LegalCopyright': 'Copyright 2016 '+APP_NAME,
        'FileDescription' : APP_DESCRIPTION,
        'OriginalFilename' : config.exeName+'.exe',
        'FileVersion' : APP_VERSION,
        'ProductVersion' : APP_VERSION,
        'ProductName' : APP_NAME,
        'InternalName' : APP_NAME,
    },
    'productVersion' : APP_VERSION,
    'fileVersion' : APP_VERSION,
    'icon': path.join(APPLICATION_SRC, 'icon.ico')
};

