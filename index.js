"use strict";

// root folder
var path = require('path');
global.rootDir = path.resolve(__dirname);

// log starten
global.log = require('./system/log.js');

// database en app starten
global.db = require('./system/database.js');
db.connect(() => {

    // models starten
    global.models = require('./system/models.js');

    const app = require('./app.js')
    const port = 3000
    
    app.listen(port, () => log.log(`Cloud OS gestart op poort ${port}`));
});
