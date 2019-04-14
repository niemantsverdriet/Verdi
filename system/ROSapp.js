"use strict";

// app klasse
class ROSApp {

    /**
     * constructor
     * 
     * @since 7 april 2019
     * @author Jan Niemantsverdriet
     */ 
    constructor() {
        this.config = {
            app__title : 'App',
            app__mode : 'text',
            app__text : 'Welkom bij mijn app',
            app__list : [],
            singular__typename : 'item',
            plural__typename : 'items',
            apps__path : '/apps',
        };
    }

    /**
     * Past de configuratie aan
     * 
     * @param {Object} settings                   nieuwe waarden voor de configuratie
     * @since 7 april 2019
     * @author Jan Niemantsverdriet
     */
    setConfig(settings) {
        for (var key in settings) {
            this.config[key] = settings[key];
        }
    }

    /**
     * Stelt alle routes in de router in
     * 
     * @param {Object} router                     de te gebruiken router
     * @since 7 april 2019
     * @author Jan Niemantsverdriet
     */
    setRouter(router) {

        // standaard delete view
        if (this.config.delete__views) {
            router.get('/delete/*', this.show.bind({ app : this, view : 'delete' }));
            router.post('/delete/*/confirm', this.deleteItem.bind({ app : this }));
        }

        // standaard edit view
        if (this.config.edit__views) {
            router.get('/edit/*', this.show.bind({ app : this, view : 'edit' }));
            router.post('/edit/*/update', this.updateOnPost.bind({ app : this }));
        }   

        // standaard new view
        if (this.config.new__views) {
            router.get('/new', this.show.bind({ app : this, view : 'new' }));
            router.post('/new/store', this.storePost.bind({ app : this }));
        } 

        // overige views
        if (this.config.app__views) {
            for (var viewname in this.config.app__views) {
                var view = this.config.app__views[viewname];
                
                // route voor view
                if (view.view__path) {
                    router.get(view.view__path, this.show.bind({ app : this, view : viewname }));
                }

                // route voor verwerking (POST) van view
                if (view.action__post && view.action_method) {
                    router.post(view.view__path + '/' + view.action__post, this[view.action_method].bind({ app : this }));
                }
            }
        }

        // route voor app zelf
        router.get('/', this.show.bind({ app : this, view : null }));

        // route voor aanpassing app instelling
        router.post('/appSetting', this.appSetting.bind({ app : this, view : null }));
    }

    /**
     * Toont het scherm van de app
     * 
     * @param {Object} req 
     * @param {Object} res 
     * @since 7 april 2019
     * @author Jan Niemantsverdriet
     */
    async show(req, res) {

        // basiswaarden
        var currentItem = null;
        var urlParams = req.originalUrl.split('/');
        var mongo = require('mongodb');

        // scope instellingen ophalen
        var config = JSON.parse(JSON.stringify(this.app.config));
        var view = this.view;
        
        // css bestanden
        config.css__urls = [ 'base', 'appbase' ];

        // standaard partitials
        config.partials = { document__head  : 'head' };

        // standaard plugins
        config.document__plugins = ['nav','display'];

        // edit modus
        if (!("edit__mode" in config)) config.edit__mode = config.default__edit ? config.default__edit : false;

        // terugknop
        config.back__navigation = '/';

        // inlog contoleren
        if (config.login__required) {
            var login = require('./login.js');
            if (!login.requireLoginScreen(config, req, res)) return;
        }

        // instellingen van de view laden
        if (view) {

            // terug naar start scherm app
            config.back__navigation = '/apps' + config.app__path;

            // instellingen op basis van standaard views
            switch(view) {
                case 'new':
                    config.app__title = 'Nieuw ' + config.singular__typename;
                    config.app__mode = 'newform';
                    break;
                case 'delete':
                    try {
                        var currentItem = await db.instance.collection(db.toCollectionName(this.app.config.model__app)).findOne({'_id' : new mongo.ObjectID(urlParams[4])});
                        var model = models.getModel(config.model__app);
                        config.doc__title = this.app.parseDisplayAttribute(config, currentItem, 'title__display');
                        config.doc__id = currentItem._id;
                        config.app__title = 'Verwijder ' + config.doc__title;
                        config.app__mode = 'delete';
                    } catch(error) {
                        config.app__title = 'Item onbekend';
                        config.app__mode = 'text';
                        log.log(error);
                    }
                    break;
                case 'edit':
                    try {
                        var currentItem = await db.instance.collection(db.toCollectionName(this.app.config.model__app)).findOne({'_id' : new mongo.ObjectID(urlParams[4])});
                        var model = models.getModel(config.model__app);
                        config.doc__title = this.app.parseDisplayAttribute(config, currentItem, 'title__display');
                        config.app__title = 'Bewerk ' + config.doc__title;
                        config.app__mode = 'editform';
                        break;
                    }  catch(error) {
                        config.app__title = 'Item onbekend';
                        config.app__mode = 'text';
                        log.log(error);
                    }
            }
        }

        // formulier aanpassingen
        if (config.app__mode == "newform" || config.app__mode == "editform") {
            var formmodel = JSON.parse(JSON.stringify(models.getModel(config.model__app)));
            for (var name in formmodel) {
                var field = formmodel[name];
                if (field.options__collection && field.options__label) {
                    var options = {};
                    if (field.placeholder) options[0] = field.placeholder;
                    if (!field.options__key) field.options__key = "{doc__id}";
                    try {
                        var dblist = await db.instance.collection(db.toCollectionName(field.options__collection)).find({}).toArray();
                        for (var i in dblist) {
                            var doc = dblist[i];
                            var key = this.app.parseDisplayAttribute2(doc, field.options__key);
                            options[key] = this.app.parseDisplayAttribute2(doc, field.options__label);
                        }
                    } catch(error) {
                        log.log(error);
                    }
                    formmodel[name].select__options = options;
                }
            }
        }

        // instellingen per type view goedzetten
        switch(config.app__mode) {
            case 'text':
                config.partials.app__view = 'apptext';
                break;
            case 'list':
                config.partials.app__view = 'applist';
                var model = models.getModel(config.model__app);
                config.css__urls.push('list');

                // relevante menu items tonen
                config.editmode__toggle = true;

                // gegevens uit de database halen
                try {
                    var dbresults = await db.instance.collection(db.toCollectionName(this.app.config.model__app)).find({}).toArray();
                } catch(error) {
                    log.log(error);
                    var dbresults = [];
                }
                config.app__list = [];
                for (var i in dbresults) {
                    var doc = dbresults[i];

                    // titel bepalen
                    doc.title__doc = this.app.parseDisplayAttribute(config, doc, 'title__display');

                    // omschrijving bepalen
                    doc.description__doc = this.app.parseDisplayAttribute(config, doc, 'description__display');

                    // afbeelding bepalen
                    if (config.default__image) doc.image__doc = config.default__image;

                    // hack voor apps app
                    delete doc.app__path;

                    // document toevoegen aan lijst
                    config.app__list.push(doc);
                }
                break;
            case 'newform':
                config.partials.app__view = 'form';
                config.css__urls.push('form');
                if (config.model__app) {
                    config.form__model = JSON.stringify(formmodel);
                    config.form__params = JSON.stringify({ 
                        submit__label : 'Opslaan',
                        post__url : '/apps' + config.app__path + '/new/store'
                    });
                }
                break; 
            case 'editform':
                config.partials.app__view = 'form';
                config.css__urls.push('form');
                if (config.model__app) {
                    config.form__model = JSON.stringify(formmodel);
                    config.form__params = JSON.stringify({ 
                        submit__label : 'Werk bij',
                        post__url : '/apps' + config.app__path + '/edit/' + currentItem._id + '/update'
                    });
                    config.form__values = JSON.stringify(currentItem);
                }
                break;
            case 'delete':
                config.partials.app__view = 'delete';
                config.css__urls.push('delete');
                break; 
            case 'applist':

                config.partials.app__view = 'shortcuts';

                config.css__urls.push('start');

                // relevante menu items tonen
                config.editmode__toggle = true;

                // gegevens uit de database halen
                try {
                    var dbresults = await db.instance.collection(db.toCollectionName(this.app.config.model__app)).find({}).toArray();
                } catch(error) {
                    log.log(error);
                    var dbresults = [];
                }
                config.app__list = [];
                for (var i in dbresults) {
                    var doc = dbresults[i];

                    // titel bepalen
                    doc.title__doc = this.app.parseDisplayAttribute(config, doc, 'title__display');

                    // omschrijving bepalen
                    doc.description__doc = this.app.parseDisplayAttribute(config, doc, 'description__display');

                    // afbeelding bepalen
                    if (config.default__image) doc.image__doc = config.default__image;

                    // hack voor apps app
                    delete doc.app__path;

                    // document toevoegen aan lijst
                    config.app__list.push(doc);
                }
                break;
        }

        // pluginslijst omzetten naar een string
        config.document__plugins = JSON.stringify(config.document__plugins);

        // view tonen
        res.render('ROSapp', config);
    }

    parseDisplayAttribute(config, doc, attribute) {
        if (!config[attribute]) return null;
        return this.parseDisplayAttribute2(doc, config[attribute]);
    }

    parseDisplayAttribute2(doc, attribute) {
        var matches = attribute.match(/\{[a-z]+__[a-z]+\}/gi);
        var result = attribute;
        for (var j in matches) {
            var fieldname = matches[j].substring(1, matches[j].length - 1);
            if (fieldname == 'doc__id') fieldname = '_id';
            var replace = doc[fieldname] ? doc[fieldname] : '';
            result = result.replace(matches[j], replace);
        }
        return result;
    }

    /**
     * Slaat post data op in de database
     * 
     * @param {Object} req 
     * @param {Object} res
     * @since 7 april 2019
     * @author Jan Niemantsverdriet
     */
    storePost(req, res) {
        db.instance.collection(db.toCollectionName(this.app.config.model__app)).insertOne(
            this.app.processFormData(models.getModel(this.app.config.model__app), req.body),
            (error, result) => {
                if (error) {
                    res.json({ error : 'Niet op kunnen slaan in database'});
                } else {
                    res.json({ success : 'Nieuw ' + this.app.config.singular__typename + ' aangemaakt' });
                }
            }
        );
    }

    /**
     * Verwijderd een item
     * 
     * @param {Object} req 
     * @param {Object} res 
     * @since 10 april 2019
     * @author Jan Niemantsverdriet
     */
    deleteItem(req, res) {
        var urlParams = req.originalUrl.split('/');
        var mongo = require('mongodb');
        db.instance.collection(db.toCollectionName(this.app.config.model__app)).deleteOne({'_id' : new mongo.ObjectID(urlParams[4])}, (error, result) => {
            if (error) res.json({ error : this.app.config.singular__typename + ' niet kunnen verwijderen' });
            else res.json({ success : this.app.config.singular__typename + ' verwijderd' });
        });
    }

    /**
     * Werkt een item bij op basis van post data
     * 
     * @param {Object} req 
     * @param {Object} res
     * @since 10 april 2019
     * @author Jan Niemantsverdriet
     */
    updateOnPost(req, res) {
        var urlParams = req.originalUrl.split('/');
        var mongo = require('mongodb');
        db.instance.collection(db.toCollectionName(this.app.config.model__app)).updateOne(
            {'_id' : new mongo.ObjectID(urlParams[4])}, 
            { $set : this.app.processFormData(models.getModel(this.app.config.model__app), req.body) }, 
            (error, result) => {
                if (error) {
                    res.json({ error : this.app.config.singular__typename + ' niet bij kunnen werken' });
                    log.log(error);
                } else res.json({ success : this.app.config.singular__typename + ' bijwerkt' });
            }
        );
    }
  
    /**
     * Maakt form data geschikt voor verdere verwerking
     * 
     * @param {Obnject} data                 de formulier van data
     * @return {@object}                     de verwerkte data
     * @since 11 april 2019
     * @author Jan Niemantsverdriet
     */
    processFormData(model, data) {
        
        var result = {};

        // door de post data heen lopen
        for (var key in data) {

            // checkbox afvangen omdat een uitgevinkte checkbox niets instuurt
            if (key.substring(0, 9) == 'checkbox-') {
                if (data[key.substring(9)]) {
                    data[key.substring(9)]= true;
                    result[key.substring(9)]= true;
                } else {
                    data[key.substring(9)]= false;
                    result[key.substring(9)]= false;
                }
            }

            // als het veld niet voorkomt in het model, niet verwerken
            if (!model[key]) continue;

            // waar aanpassen per type
            switch (model[key].field__type) {
                case 'password':
                    if (data[key] != '') {
                        var crypto = require('./crypt.js');
                        result[key] = crypto.encryptPassword(data[key]);
                    }
                    break;
                default:
                    result[key] = data[key];
            }
        }
        return result;
    }

    /**
     * Verwerkt de aanpassing van een instelling voor deze app
     * 
     * @param {*} req 
     * @param {*} res 
     * @since 12 april 2019
     * @author Jan Niemantsverdriet
     */
    appSetting(req, res) {
        if (!req.body.name) res.json({ error : 'Geen naam van instelling gegeven' });
        if (!("value" in req.body)) res.json({ error : 'Geen waarde voor de instelling gegeven' });
        var value = req.body.value;
        if (value === 'true') value = true;
        if (value === 'false') value = false; 
        this.app.config[req.body.name] = value;
        res.set('X-ROS-reload-page', 'true');
        res.json({ success : req.body.name  + ' aangepast naar ' + JSON.stringify(value) });
    }
}

module.exports = ROSApp;