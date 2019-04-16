"use strict";

// load modules
var express = require('express');
var system = express();
var db = require(rootDir + '/system/database.js');
var log = require(rootDir + '/system/log.js');

async function loadApps(system) {
    try {
        var apps = await db.instance.collection(db.toCollectionName('system__apps')).find({}).toArray();
    } catch(error) {
        log.log(error);
        var apps = [];
    }

    // apps registreren
    for (var i in apps) {

        var config = apps[i];

        // naam controleren
        if (!config.app__title) {
            log.log('Bij app ' + i + ' is geen naam opgegeven, app niet toegevoegd');
            continue;
        }

        // pad controleren
        if (!config.app__path) {
            log.log('Bij app ' + config.app__path + ' is geen geen pad opgegeven, app niet toegevoegd');
            continue;
        }

        // app registreren bij router
        if (config.app__path == '/datafields2') {
            system.use(config.app__path, require('../apps' + config.app__path).router);
        } else {  
            const ROSapp = require('../system/ROSapp');
            var app = new ROSapp();
            app.setConfig(config);
            var router = express.Router();
            app.setRouter(router);
            system.use(config.app__path, router);
        }

        // eventueel app registreren als model factory
        if (app.modelcategories) {
            for (var i in app.modelcategories) {
                models.registerApp(app.modelcategories[i], app.path);
            }
        }
    }
}

loadApps(system);

module.exports = system;
