"use strict";

// models klasse
class Models {

    /**
     * Constructor
     * 
     * @since 8 april 2019
     * @author Jan Niemantsverdriet
     */
    constructor() {
        this.models = { public : {} };
        this.apps = {};
        this.loadModels();
    }

    async loadModels() {
        
        // datamodellen uit de database halen
        try {
            var dblist = await db.instance.collection(db.toCollectionName('system.datamodels')).find({}).toArray();
        } catch(error) {
            var dblist = {};
            log.log(error);
        }

        // modellen laden
        var models = {};
        for (var i in dblist) {
            var model = dblist[i];
            models[model._id] = { namespace : model.model__namespace, name : model.model__name, fields : [] };
        }
           
        // velden uit de database halen
        try {
            var dblist = await db.instance.collection(db.toCollectionName('system.fields')).find({}).toArray();
        } catch(error) {
            var dblist = {};
            log.log(error);
        }

        // velden laden
        for (var i in dblist) {
            var field = dblist[i];
            if (!models[field.field__model]) continue;
            models[field.field__model].fields.push(field);
        }

        // datamodellen inladen
        for (var id in models) {
            var model = models[id];
            // if (model.name == 'datamodels' || model.name == 'apps') this.addModel(model.namespace, model.name, model.fields);
            // if (model.name == 'datamodels' || model.name == 'apps') this.addModel(model.namespace, model.name, model.fields);
            this.addModel(model.namespace, model.name, model.fields);
        }
    }

    /**
     * Voegt een model toe
     * 
     * @param {String} namespace                de namespace waarbinnen het model zich bevind
     * @param {String} name                     de naam van het model
     * @param {Object} model                    het model zelf
     * @since 8 april 2019
     * @author Jan Niemantsverdriet
     */
    addModel(namespace, name, model) {
        
        // namespace aanmaken
        if (!this.models[namespace]) this.models[namespace] = {};

        // controleren of het model niet al bestaat
        if (this.models[namespace][name]) {
            log.log('Model ' + name + ' bestaat al in ' + namespace + ', model niet toegevoegd');
            return;
        }

        // model toevoegen
        this.models[namespace][name] = model;
    }

    /**
     * Geeft de informatie over een model
     * 
     * @param {String} namespace                de namespace waarbinnen het model zich bevind
     * @param {String} name                     de naam van het model
     * @return {Object}                         het model
     * @since 8 april 2019
     * @author Jan Niemantsverdriet
     */
    getModel(fullname) {

        // parameter controleren
        if (!fullname) {
            log.log('Geen model opgegeven');
            return {};
        }
        
        // fullname splitsen
        var model = fullname.split('.');
        var namespace = model[0];
        var name = model[1];

        // kijken of model bestaat
        if (!this.modelExists(namespace, name)) {
            
            // kijken of het nog gegenereerd kan worden
            var found = false;
            if (this.apps[namespace]) {
                var path = require('path');
                for (var i in this.apps[namespace]) {
                    var app = require(global.rootDir + '/apps/' + this.apps[namespace][i]).app;
                    if (app.config && app.config.app__models) {
                        for (var modelname in app.config.app__models) {
                            var model = app.config.app__models[modelname];
                            if (modelname == fullname) this.addModel(namespace, name, model);
                            found = true;
                            break;
                        }
                    }
                }
            }
            if (!found) return {};
        }

        // model retourneren
        return this.models[namespace][name];
    }

    /**
     * Controleert of een model bekend is
     * 
     * @param {String} namespace                de namespace waarbinnen het model zou moeten zitten
     * @param {String} name                     de naam van het model
     * @since 8 april 2019
     * @author Jan Niemantsverdriet
     */
    modelExists(namespace, name) {
        if (!this.models[namespace]) return false;
        return (name in this.models[namespace]);
    }

    /**
     * Registreerd een app als mogelijke factory voor modellen
     * 
     * @param {String} namespace                de namespace waarbinnen de app modellen zou kunnen leveren
     * @param {String} appname                  de naam van de app
     * @since 8 april 2019
     * @author Jan Niemantsverdriet
     */
    registerApp(namespace, appname) {
        if (!this.apps[namespace]) this.apps[namespace] = [];
        this.apps[namespace].push(appname);
    }
}

module.exports = new Models();