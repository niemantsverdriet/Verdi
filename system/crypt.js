"use strict";

// crypto klasse
class Crypt {

    /**
     * constructor
     * 
     * @since 14 april 2019
     * @author Jan Niemantsverdriet
     */ 
    constructor() {
    }

    /**
     * Zet het wachtwoord om naar een hash
     * 
     * @param {String} password               het ingevoerde wachtwoord
     * @since 14 april 2019
     * @author Jan Niemantsverdriet
     */
    encryptPassword(password) {
        const crypto = require('crypto');

        const secret = 'cloud-os-salty-string-for-passwords';
        const hash = crypto.createHmac('sha256', secret)
                        .update(password)
                        .digest('hex');

        return hash;
    }
}

module.exports = new Crypt();