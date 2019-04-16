"use strict";

// loading modules
var language = require(rootDir + '/system/language.js');
var db = require(rootDir + '/system/database.js');
var log = require(rootDir + '/system/log.js');

/**
 * Login class: responsible login, autologin and the login screen
 */
class Login {

    /**
     * constructor
     * 
     * @since 14 april 2019
     * @author Jan Niemantsverdriet
     */ 
    constructor() {
    }

    /**
     * Processes the autologin or shows the login screen
     *
     * @param {Object} req - the express request object
     * @param {Object} res - the express response object
     * @return boolean true = logged in, other content can be shown
     * @since 14 april 2019
     * @author Jan Niemantsverdriet
     */
    requireLoginScreen(config, req, res) {

        // check for login
        if (req.session.user) return true;
        
        // process autologin
        if (req.cookies && 'loginToken' in req.cookies) {
            var token = req.cookies.loginToken;
            db.instance.collection(db.toCollectionName('system.users')).findOne({'token__autologin' : token }, (error, user) => {
                if (user) {

                    // log the user in and reload the page
                    this.loginUser(user, req, res);
                    return res.redirect('back');
                } else {

                    // remove the cooke and reload the pase
                    res.clearCookie('loginToken');
                    return res.redirect('back');
                }
            });
        } else {
             
            // configure the login display
            if (!config.partials) config.partials = {};
            config.partials.app__view = 'form';
            config.css__urls.push('form');
            if (config.model__app) {
                var form__model = {
                    person__email : {
                        field__name : 'person__email',
                        form__label : language.translate("Username"),
                        field__required : true,
                        field__placeholder : language.translate("my@emailaddress.com"),
                        field__type: "username",
                    },
                    login__password : {
                        field__name : 'login__password',
                        form__label : language.translate("Password"),
                        field__required : true,
                        field__type: "password",
                    }
                };
                config.form__model = JSON.stringify(form__model);
                config.form__params = JSON.stringify({ 
                    submit__label : language.translate('Log in'),
                    post__url : '/login'
                });
            }

            // description above the form
            // config.intro__form = language.translate('Log in is required for app {app__title}').replace('{app__title}', config.app__title);

            // turn the plugin list into a string
            config.document__plugins = JSON.stringify(config.document__plugins);

            // show login view
            res.render('ROSapp', config);
        }

        // return false to prevent the display of other content
        return false;
    }

    async processLogin(req, res) {

        // controleren of er post data is
        if (!req.body) {
            res.json({ error : 'server kon gegevens niet afhandelen'});
        }

        var fielderrors = {};

        // controleren of er een gebruikersnaam is
        if (!req.body.person__email || req.body.person__email == '') {
            fielderrors['person__email'] = 'Geef een gebruikersnaam op';
        }

        // controleren of er een wachtwoord is
        if (!req.body.login__password || req.body.login__password == '') {
            fielderrors['login__password'] = 'Voer een wachtwoord in';
        }

        // indien er al fouten waren deze nu tonen
        if (Object.keys(fielderrors).length > 0) {
            res.json({ error__fields : fielderrors });
        }

        // gebruiker ophalen
        try {
            var user = await db.instance.collection(db.toCollectionName('system.users')).findOne({'person__email' : req.body.person__email });
            if (user) {
                var crypto = require('./crypt.js');
                var passHash = crypto.encryptPassword(req.body.login__password);
                if (user.user__password == passHash) {
                    if (!user.token__autologin) {
                        user.token__autologin = crypto.encryptPassword(req.body.login__password + Date.now());
                        var mongo = require('mongodb');
                        db.instance.collection(db.toCollectionName('system.users')).updateOne(
                            {'_id' : new mongo.ObjectID(user._id)}, 
                            { $set : user }, 
                            (error, result) => {
                                if (error) {
                                    res.json({ error : 'Geen autologin token aan kunnen maken' });
                                    log.log(error);
                                } else {
                                    var login = require('./login.js');
                                    if (login.loginUser(user, req, res)) {

                                    } else {
                                        res.json({ error : user.person__firstname + ' niet in kunnen loggen' });
                                    }
                                }
                            }
                        );
                        db.instance.collection(db.toCollectionName('system.users')).findOne({'person__email' : req.body.person__email });
                    } else {
                        var login = require('./login.js');
                        if (login.loginUser(user, req, res)) {
                            res.set('X-ROS-reload-page', 'true');
                            res.json({ success : user.person__firstname + ' ingelogd, app openen' });
                        } else {
                            res.json({ error : user.person__firstname + ' niet in kunnen loggen' });
                        }
                    }
                } else {
                    res.json({ error__fields : { login__password : 'Incorrect wachtwoord' } });
                }
            } else {
                res.json({ error__fields : { person__email : 'Geen gebruiker met email adres ' + req.body.person__email + 'bekend' } });
            }
        } catch(error) {
            log.log(error);
            res.json({ error : 'problemen met ophalen gebruiker'});
        }
    }

    loginUser(user, req, res) {
        req.session.user = user;
        req.session.save();
        res.cookie('loginToken', user.token__autologin);
        return true;
    }
}

module.exports = new Login();