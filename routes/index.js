var express = require('express');
var router = express.Router();

async function loadApps(router) {
    try {
        var apps = await db.instance.collection(db.toCollectionName('system__apps')).find({}).toArray();
    } catch(error) {
        log.log(error);
        var apps = [];
    }

    global.apps = apps;
    console.log(apps);

    /* Startscherm weergeven */
    router.get('/', function(req, res) {
        res.render('startscreen', {
            title:  'Remote OS',
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

//     {
//         name : 'apps',
//         icon : {
//             type : 'md-icon',
//             id : 'apps'
//         },
//         path : 'appoverview',
//         modelcategories : [ 'system' ]
//     },
//     {
//         name : 'data modellen',
//         icon : {
//             type : 'md-icon',
//             id : 'storage'
//         },
//         path : 'datamodels',
//         modelcategories : [ 'system' ]
//     },
//     {
//         name : 'velden',
//         icon : {
//             type : 'md-icon',
//             id : 'format_align_left'
//         },
//         path : 'datafields',
//         modelcategories : [ 'system' ]
//     },
//     {
//         name : 'recepten',
//         icon : {
//             type : 'md-icon',
//             id : 'local_dining'
//         },
//         path : 'recipes',
//         modelcategories : [ 'food' ]
//     }
// ];

module.exports = router;
