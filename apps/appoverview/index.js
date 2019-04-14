var express = require('express');
var router = express.Router();
const ROSapp = require('../../system/ROSapp');
const app = new ROSapp();

app.setConfig({
    app__title : "Apps overzicht",
    app__mode : "list",
    singular__typename : "app",
    plural__typename : "apps",
    model__app : "system.apps",
    app__path : "/appoverview",
    app__views : {
        new : {
            view__path : '/new',
            action__post : 'store',
            action_method : 'storePost'
        },
        delete : {
            view__path : '/delete/*',
            action__post : 'confirm',
            action_method : 'deleteItem'
        },
        edit : {
            view__path : '/edit/*',
            action__post : 'update',
            action_method : 'updateOnPost'
        }
    },
    display__attributes : {
        title__display : "{app__title}",
    },
});

// app__models : {
//     "system.apps" : {
//         app__title : {
//             label : "Naam",
//             required : true,
//             placeholder : "bv. Mijn app"
//         },
//         app__mode : {
//             label : "Type app",
//             type : 'select',
//             required : true,
//             options : {
//                 none : "selecteer een type",
//                 text : "tonen van teksten",
//                 list : "op basis van een lijst"
//             }
//         },
//         app__path : {
//             label : "ID voor de app",
//             required : true,
//             placeholder : "bv. myapp"
//         },
//         singular__typename : {
//             label : "Enkelvoud lijstitem",
//             required : true,
//             placeholder : "bv. item"
//         },
//         plural__typename : {
//             label : "Meervoud lijstitem",
//             required : true,
//             placeholder : "bv. items"
//         }
//     }
// },

app.setRouter(router);

module.exports.router = router;
module.exports.app = app;