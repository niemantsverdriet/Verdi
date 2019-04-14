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
            
            // element waar de inline message in getoond moet worden
            var oElement = document.getElementById(id);
            if (!oElement) return;
            
            // controleren of er uberhaupt een reactie is
            if (!data || Object.keys(data).length == 0) mod.message.inline(id, { info : 'geen reactie van de server' });
            
            // standaard reacties afvangen
            var checks = ['success', 'info', 'warn', 'error'];
            for (var i in checks) {
                if (data[checks[i]]) {
                    oElement.innerHTML = '';
                    var paragraph = document.createElement('p');
                    paragraph.innerHTML = data[checks[i]];
                    paragraph.className = 'inline_message ' + checks[i];
                    oElement.appendChild(paragraph);
                }
            }
        }
    }

    mod.markAsLoaded('message');
}