"use strict";

// log klasse
class Log {

    /**
     * constructor
     * 
     * @since 31 maart 2019
     * @author
     */ 
    constructor() {
    }

    /**
     * Vraagt JSON data op en geeft het aan de callback
     * 
     * @param {String} url                      de url waar de JSON te vinden is
     * @param {String} url                      de url waar de JSON te vinden is
     * @param {String} url                      de url waar de JSON te vinden is
     * @author Jan Niemantsverdriet
     * @since 26 maart 2019
     */
    log(title, icon, message) {
        
        // variablen goedzetten
        if (!title) return;
        if (!message) message = ''
        if (!icon) icon = 'info';

        // datum bepalen
        var nowDate = Date.now();
        var now = new Date();
        var date =  now.getFullYear() + '-' + 
                    ('0' + now.getMonth()).slice(-2) + '-' +
                    ('0' + now.getDate()).slice(-2) + ' ' +
                    ('0' + now.getHours()).slice(-2) + ':' +
                    ('0' + now.getMinutes()).slice(-2) + ':' +
                    ('0' + now.getSeconds()).slice(-2);

        // naar console loggen
        console.log(date + ' | ' + title + (message == '' ? '' : ': ' +  message));
                    
        // opslaan in database
        // if (message != 'nodb') {
        //     var doc = {
        //         title : title,
        //         message : message,
        //         icon : icon,
        //         time : now,
        //         date : date
        //     }
        //     db.instance.collection('log').insertOne(doc, (err, res) => {});
        // }
    }
}

module.exports = new Log();