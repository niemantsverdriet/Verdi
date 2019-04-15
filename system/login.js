"use strict";

// app klasse
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
     * Toont het login scherm indien nodig
     *
     * @param {Object} req
     * @param {Object} res
     * @return boolean                  true = inlogscherm hoeft niet getoond te worden
     * @since 14 april 2019
     * @author Jan Niemantsverdriet
     */
    requireLoginScreen(config, req, res) {

        // inlog checken
        if (req.session.user) return true;
        
        if (req.cookies && 'loginToken' in req.cookies) {
            var token = req.cookies.loginToken;
            db.instance.collection(db.toCollectionName('system.users')).findOne({'token__autologin' : token }, (error, user) => {
                if (user) {
                    this.loginUser(user, req, res);
                    return res.redirect('back');
                } else {
                    res.clearCookie('loginToken');
                    return res.redirect('back');
                }
            });
        } else {
            
            if (!config.partials) config.partials = {};
            config.partials.app__view = 'form';
            config.css__urls.push('form');
            if (config.model__app) {
                var form__model = {
                    person__email : {
                        field__name : 'person__email',
                        form__label : "Gebruikersnaam",
                        field__required : true,
                        field__placeholder : "bv. mijn@emailadres.nl",
                        field__type: "username",
                    },
                    login__password : {
                        field__name : 'login__password',
                        form__label : "Wachtwoord",
                        field__required : true,
                        field__type: "password",
                    }
                };
                config.form__model = JSON.stringify(form__model);
                config.form__params = JSON.stringify({ 
                    submit__label : 'Log in',
                    post__url : '/login'
                });
            }

            config.intro__form = `Voor ${config.app__title} is inloggen vereist.`;

            // pluginslijst omzetten naar een string
            config.document__plugins = JSON.stringify(config.document__plugins);

            // view tonen
            res.render('ROSapp', config);
        }

        // geen verdere schermen tonen
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