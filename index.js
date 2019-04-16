"use strict";

// root folder
var path = require('path');
global.rootDir = path.resolve(__dirname);

// load modules
var language = require(rootDir + '/system/language.js');
var db = require(rootDir + '/system/database.js');
var log = require(rootDir + '/system/log.js');

// load configuration
var config = require('./config.js');

// start database
db.connect(() => {

    // load translations
    language.loadTranslations(config.app__language, () => {

        // load models
        global.models = require('./system/models.js');

        // start app
        const app = require('./app.js')
        app.listen(config.port__number, () => log.log(`Verdi OS gestart op poort ${config.port__number}`));
    })
});
