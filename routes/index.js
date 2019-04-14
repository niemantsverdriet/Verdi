var express = require('express');
var router = express.Router();

async function loadApps(router) {
    try {
        var apps = await db.instance.collection(db.toCollectionName('system__apps')).find({}).toArray();
    } catch(error) {
        log.log(error);
        var apps = [];
    }

    /* Startscherm weergeven */
    router.get('/', function(req, res) {
        res.render('startscreen', {
            title:  'Cloud OS',
            apps :  apps,
            partials : {
                document__head  : 'head'
            },
            css__urls : [ 'base', 'start' ],
            document__plugins : "[ 'nav' ]"
        });
    });
}

loadApps(router);

module.exports = router;