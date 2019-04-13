"use strict";

// marktet klasse
class Database {

    /**
     * constructor
     * 
     * @since 30 maart 2019
     * @author
     */ 
    constructor() {
        this.client = require('mongodb').MongoClient;
        this.url = "mongodb://admin:UevKCJHxcXcJ7BYA@localhost:27017/ROS";
    }

    /**
     * Start de database connectie
     * 
     * @param {Function} callback               de callback functie die aangeroepen wordt zodra de connectie gelegd is
     * @since 31 maart 2019
     * @author Jan Niemantsverdriet
     */
    connect(callback) {
        this.client.connect(this.url, { useNewUrlParser: true }, (err, database) => {
            if (err) {
                log.log('kan geen verbinding maken met de database');
                process.exit();
            }

            this.instance = database.db("ROS");
            callback();
        });
    }

    /**
     * Zet de naam van het model om naar de naam voor de databacollectie
     * 
     * @param {String} model                    de naam voor het model
     * @return {String}                         de collectienaam
     * @since 10 april 2019
     * @author Jan Niemantsverdriet
     */
    toCollectionName(model) {
        return model.replace('.', '__');
    }
}

module.exports = new Database();