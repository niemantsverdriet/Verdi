var express = require('express');
var router = express.Router();
const ROSapp = require('../../system/ROSapp');
const app = new ROSapp();

app.setConfig({
    app__title : "Recepten",
    app__mode : "list",
    app__path : "/recipes",
    singular__typename : "recept",
    plural__typename : "recepten",
    app__models : {
        "food.recipes" : {
            name : {
                label : "Titel",
                required : true
            },
            photo : {
                label : "Foto",
                type : 'image'
            }            
        }
    },
    main__model : "food.recipes",
    app__views : {
        new : {
            view__path : '/new'
        }
    }
});

app.setRouter(router);

module.exports.router = router;
module.exports.app = app;