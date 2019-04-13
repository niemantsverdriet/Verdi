"use strict";

// delete klasse
if (!mod.delete) {
    mod.delete = {

        /**
         * Verstuurt het verzoek om een item te verwijderen
         * 
         * @param {String} url                  de url waarmee het verzoek uitgevoerd wordt
         * @since 10 april 2019
         * @author Jan Niemantsverdriet
         */
        request(url) {

            // data versturen
            jQuery.ajax({
                type        : 'POST',
                url         : url,
                data        : {},
                dataType    : 'json',
                encode      : true
            }).done(mod.delete.response);
        },

        response(data) {
            mod.onLoaded(['message'], () => { mod.message.inline('delete', data) });
        }
    }

    mod.markAsLoaded('delete');
}