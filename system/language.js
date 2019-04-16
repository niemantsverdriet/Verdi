"use strict";

// load modules
var log = require(rootDir + '/system/log.js');
var db = require(rootDir + '/system/database.js');

/**
 * Language class: responsible for translations
 */
class Language {

    /**
     * constructor
     * 
     * @since 16 april 2019
     * @author Jan Niemantsverdriet
     */ 
    constructor() {
        this.currentLang = "en";
        this.defaultLang = "en";
        this.translations = {};
    }

    /**
     * Loads all the translations from the database
     * 
     * @param {String} currentLang - sets the currentlanguage
     * @param {Function} callback - the callback function called when all translations are loaded
     * @since 16 april 2019
     * @author Jan Niemantsverdriet
     */
    loadTranslations(currentLang, callback) {
        this.currentLang = currentLang;
        var callback = callback;

        // load all translations
        db.instance.collection(db.toCollectionName('system.translations')).find({}).toArray((error, list) => {
            if (error) log.log(error);
            else {
                for (var i in list) {
                    var translation = list[i];
                    this.translations[list[i].en__translation] = list[i].nl__translation;
                }
                console.log(this.translations);
            }
            callback();
        });
    }

    /**
     * Translates a sentence or word
     * 
     * @param {String} sentence - the sentence or word that needs to be translated
     * @param {String} fromLang - the abbreviation of the language the sentence or word is written in ("en", "nl", etc.)
     * @param {String} toLang - the abbreviation of the language the sentence needs to be translated to ("en", "nl", etc.)
     * @return {String} the translated sentence or word
     * @since 16 april 2019
     * @author Jan Niemantsverdriet
     */
    translate(sentence, toLang, fromLang) {

        
        // setting default en current language
        if (!fromLang) fromLang = this.defaultLang;
        if (!toLang) toLang = this.currentLang;
        
        // if from and to language are the same, no translation is needed
        if (fromLang == toLang) return sentence;
        
        // if there is no translation available, set translation request in database
        if (!(sentence in this.translations)) {
            var language = this;
            
            // setting a translation request
            db.instance.collection(db.toCollectionName('system.translations')).updateOne(
                { 'en__translation' : sentence }, 
                { $set : { 'en__translation' : sentence, 'nl__translation' : '' } }, 
                { upsert : true },
                (error, result) => {
                    if (error) log.log(error);
                    else language.loadTranslations(language.currentLang, () => {});
                }
            );

            // return current, not translated sentence
            return sentence;
        }

        // if the translation is not enterred yet, return the current sentence (better then return an emtpy string)
        if (this.translations[sentence] == '') return sentence;

        // return the translation
        return this.translations[sentence];
    }
}

module.exports = new Language();