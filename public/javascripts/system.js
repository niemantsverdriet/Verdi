"use strict";

// system klasse
if (!mod.system) {
    mod.system = {

        /**
         * Wijzigt de instelling van een app
         * 
         * @param {String} url                  de url van de app
         * @param {String} setting              de naam van de instelling
         * @param {mixed} value                 de nieuwe waarde voor de instelling
         * @since 12 april 2019
         * @author Jan Niemantsverdriet
         */
        appSetting(url, setting, value) {

            // verzoek versturen
            jQuery.ajax({
                type        : 'POST',
                url         : url + '/appSetting',
                data        : { name : setting,
                                value : value },
                dataType    : 'json',
                encode      : true
            }).done(mod.system.responseAppSetting);
        },

        /**
         * Verwerkt de response van het aanpassen van de instelling van de app
         * 
         * @param {*} data                      de reactie van de server
         * @since 12 april 2019
         * @author Jan Niemantsverdriet
         */
        responseAppSetting(data, textStatus, request) {
            if (mod.system.handleServerResponse(data, textStatus, request)) return;
        },

        /**
         * Verwerkt standaard acties in server responses
         * 
         * @param {Object} data                 de data van de server
         * @param {String} textStatus           de reactie van de server als tekst
         * @param {Object} request              het request object
         * @since 12 april 2019
         * @author Jan Niemantsverdriet
         */
        handleServerResponse(data, textStatus, request) {
            
            // herladen van de pagina afhandelen
            if (request.getResponseHeader('X-ROS-reload-page') == 'true') {
                location.reload();
                return true;
            }
        }
    }

    mod.markAsLoaded('system');
}