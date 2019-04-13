var express = require('express');
var system = express();

for (var i in global.apps) {
    var app = apps[i];

    // naam controleren
    if (!app.name) {
        log.log('Bij app ' + i + ' is geen naam opgegeven, app niet toegevoegd');
        continue;
    }

    // pad controleren
    if (!app.path) {
        log.log('Bij app ' + app.name + ' is geen geen pad opgegeven, app niet toegevoegd');
        continue;
    }

    // app registreren bij router
    system.use('/' + app.path, require('../apps/' + app.path).router);

    // eventueel app registreren als model factory
    if (app.modelcategories) {
        for (var i in app.modelcategories) {
            models.registerApp(app.modelcategories[i], app.path);
        }
    }
}

module.exports = system;
