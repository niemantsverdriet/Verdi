"use strict";

// meldingen klasse
if (!mod.message) {
    mod.message = {

        /**
         * Plaatst een melding in een opgegeven element
         * 
         * @param {String} id                   het id van het dom element waar de melding in moet komen
         * @param {Object} data                 de json response van een call
         * @since 10 april 2019
         * @author Jan Niemantsverdriet
         */
        inline(id, data) {
            var oElement = document.getElementById(id);
            if (!oElement) return;

            var checks = ['success', 'info', 'warn', 'error'];
            var found = false;
            oElement.innerHTML = '';
            for (var i in checks) {
                if (data[checks[i]]) {
                    var paragraph = document.createElement('p');
                    paragraph.innerHTML = data[checks[i]];
                    paragraph.className = 'inline_message ' + checks[i];
                    oElement.appendChild(paragraph);
                    found = true;
                }
            }
            
            if (!found) mod.message.inline(id, { info : 'geen reactie van de server' });
        }
    }

    mod.markAsLoaded('message');
}