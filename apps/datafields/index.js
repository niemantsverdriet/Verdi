var express = require('express');
var router = express.Router();
const ROSapp = require('../../system/ROSapp');
const app = new ROSapp();

app.setConfig({
    app__title : "Velden",
    app__mode : "list",
    app__path : "/datafields",
    singular__typename : "veld",
    plural__typename : "velden",
    default__edit : true,
    app__models : {
        "system.fields" : {
            field__model : {
                field__name : 'field__model',
                form__label : "In model",
                field__required : true,
                field__placeholder : "selecteer model",
                crud__display : "new",
                field__type: "select",
                options__collection : "system.datamodels",
                options__label : "{model__namespace}.{model__name}"
            },
            field__name : {
                field__name : 'field__name',
                form__label : "Naam",
                field__required : true,
                field__placeholder : "bv. name",
                crud__display : "new"
            },
            form__label : {
                field__name : 'form__label',
                form__label : "Formulier label",
                field__placeholder : "bv. Naam",
            },
            field__required : {
                field__name : 'field__required',
                form__label : "Verplicht veld",
                field__type : "checkbox",
            },
            field__type : {
                field__name : 'field__type',
                form__label : "Type",
                field__type : "select",
                select__options : { 'shorttext' : 'korte tekst', 'text' : 'tekst', 'select' : 'keuzelijst', 'image' : 'afbeelding', "checkbox" : "selectievakje" },
                run__onchange : 'mod.vars.setVars({cat__select : mod.form.getValue(this) == \'select\'})'
            },
            select__options : {
                field__name : 'select__options',
                form__label : "Opties (als json)",
                field__type : "text",
                hideon__script : '!cat__select'
            },
            options__collection : {
                field__name : 'options__collection',
                form__label : "Opties uit datamodel",
                field__type: "select",
                field__placeholder : "selecteer een datamodel",
                options__collection : "system.datamodels",
                options__label : "{model__namespace}.{model__name}",
                options__key : "{model__namespace}.{model__name}",
                hideon__script : '!cat__select'
            },
            options__label : {
                field__name : 'options__label',
                form__label : "Weergave voor opties",
                field__placeholder : "bv. {name__item}",
                hideon__script : '!cat__select'
            },
            options__key : {
                field__name : 'options__key',
                form__label : "Sleutel voor opties",
                field__placeholder : "bv. {_id}",
                hideon__script : '!cat__select'
            },
            field__placeholder : {
                field__name : 'field__placeholder',
                form__label : "Placeholder",
                field__placeholder : "b.v. type hier de naam",
                options__collection : "system.datamodels",
                options__label : "{model__namespace}.{model__name}"
            },
            crud__display : {
                field__name : 'crud__display',
                form__label : "CRUD",
                field__type : "select",
                select__options : { 'all' : 'alle', 'new' : 'alleen bij nieuwe elementen', 'edit' : 'enkel bij bewerken' },
            }
        }
    },
    display__attributes : {
        title__display : "{form__label} ({field__name})",
    },
    main__model : "system.fields",
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