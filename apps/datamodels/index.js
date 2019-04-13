var express = require('express');
var router = express.Router();
const ROSapp = require('../../system/ROSapp');
const app = new ROSapp();

app.setConfig({
    app__title : "Data modellen",
    app__mode : "list",
    app__path : "/datamodels",
    singular__typename : "datamodel",
    plural__typename : "datamodellen",
    default__edit : true,
    display__attributes : {
        title__display : "{model__namespace}.{model__name}",
        title__description : "{model__description}"
    },
    main__model : "system.datamodels",
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
    }
});

app.setRouter(router);

module.exports.router = router;
module.exports.app = app;