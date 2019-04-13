"use strict";

// vars klasse
if (!mod.vars) {
    mod.vars = {

        vars : {},

        /**
         * Stelt nieuwe variabelen in
         * 
         * @param {Object} vars                 de nieuwe variabelen
         * @since 11 april 2019
         * @author Jan Niemantsverdriet
         */
        setVars(vars) {
            for (name in vars) {
                
                // variabele registreren
                mod.vars.vars[name] = vars[name];

                // teksten in elementen vervangen
                jQuery(mod.vars.createSelector('textonvar', vars)).each(function(index) {
                    jQuery(this).html(mod.vars.evaluate(this, 'textonvar'));
                });

                // maximale breedte
                jQuery(mod.vars.createSelector('max-width', vars)).each(function(index) {
                    jQuery(this).css({ 'max-width' : mod.vars.evaluate(this, 'max-width') });
                });

                // data source
                jQuery(mod.vars.createSelector('src', vars)).each(function(index) {
                    CPJL.MustacheList.vLoadUrl(mod.vars.evaluate(this, 'src'));
                });

                // tonen of verbergen van elementen
                jQuery(mod.vars.createSelector('hidden', vars)).each(function(index) {
                    if (mod.vars.evaluate(this, 'hidden')) jQuery(this).hide();
                    else jQuery(this).show();
                });

                // laden van een lijst
                jQuery(mod.vars.createSelector('listdata', vars)).each(function(index) {
                    CPJL.MustacheList.vParseTemplateOnBind(this);
                });

                // formulier waarden bijwerken
                jQuery(mod.vars.createSelector('bindformvalue', vars)).each(function(index) {
                    var bBlockSubmits = CPJL.Form.bBlockSubmits;
                    CPJL.Form.bBlockSubmits = true;
                    CPJL.Form.vSetFieldValue(this, mod.vars.evaluate(this, 'bindformvalue'));
                    CPJL.Form.bBlockSubmits = bBlockSubmits;
                });
            }
        },

        /**
         * Geeft de waarde van de variabele
         * 
         * @param {String} name                 de naam van de variabele
         * @return {mixed}                      de waarde van de variabele (null indien niet gevonden)
         * @since 11 april 2019
         * @author Jan Niemantsverdriet
         */
        getVar(name) {
            if (!mod.vars.vars[name]) return null;
            return mod.vars.vars[name];
        },

        /**
         * Gegenereerd een selector om de juiste gewijzigde elementen mee te pakken
         *
         * @param {String} datanameAttr 	    het dataname attribuut waarin gezocht moet worden
         * @param {Object} vars		    	    de gewijzigde variabelen
         * @return {String} 					de jQuery selector
         * @since 11 april 2019
         * @author Jan Niemantsverdriet
         */
        createSelector : function(datanameAttr, vars) {
            var selector = 'g';
            for (var key in vars) {
                if (selector != '') selector = selector + ', ';
                selector = selector + '*[data-' + datanameAttr + '*=\'' + key.replace('@','_at_') + '\']';
            }
            return selector;
        },

        /**
         * Haalt de expressie op en evaluaeert deze
         *
         * @param {DOM} element 			    het DOM element waarvan de expressie geevealueerd moet worden
         * @param {String} datanameAttr 	    de naam van het data attribuut waar de expressie in staat
         * @return {mixed} 					    het resultaat van de expressie
         * @since 11 april 2019
         * @author Jan Niemantsverdriet
         */
        evaluate : function(element, datanameAttr) {
            var expression = element.dataset[datanameAttr];
            if (!expression) {
                mod.warn('Data attribuut ' + datanameAttr + ' om te evalueren is niet gevonden bij element ' + element.id);
                return element;
            }
            expression = expression.replace(/[a-z0-9\-_]+__[a-z0-9\-_.]+/g, function(dataname) {
                return '(mod.vars.vars[\'' + dataname + '\'] ? mod.vars.vars[\'' + dataname + '\'] : null)';
            });
            return eval(expression);
        }
    }

    mod.markAsLoaded('vars');
}