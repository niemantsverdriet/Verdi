"use strict";

if (!mod) {

	// De klasse zelf
	var mod = {
		loadedScripts : [],
		aLoadedCSS : [],
		toLoad : [],
		plugins : [],
		pluginsLoading : [],
		toProcess : [],
		oPluginLocations : {},
		iVersion : 0,
		bLocalStoragePrepped : false,
		bUseLocalStorage : false,
		reviveToDo : null,
		processing : false,
		aEvents : {},

		/**
		 * Markeert een plugin als beschikbaar
		 *
		 * @param String name					de naam van de plugin
		 * @author Jan Niemantsverdriet
		 * @since 7 april 2019
		 */
		markAsLoaded : function (name) {
			for (var key in this.plugins) {
				if (mod.plugins[key] == name) {
					mod.warn('plugin ' + name + ' was al geladen');
					return;
				}
			}
			mod.plugins.push(name);
			mod.processToDo();
		},

		/**
		 * Markeert een plugin als loading, zodat niet een andere call ook tegelijkertijd kan laden
		 *
		 * @param String name					de naam van de plugin
		 * @author Jan Niemantsverdriet
		 * @since 7 april 2019
		 */
		pluginLoadingAllowed : function (name) {
			for (var key in this.aPluginsLoading) {
				if (mod.aPluginsLoading[key] == name) return false;
			}
			mod.pluginsLoading.push(name);
			return true;
		},

		/**
		 * Geeft aan of een plugin geladen is
		 *
		 * @param String name			    	de naam van de plugin
		 * @return boolean						true = de plugin is beschikbaar
		 * @author Jan Niemantsverdriet
		 * @since 7 april 2019
		 */
		isLoaded : function (name) {
			for (var key in mod.plugins) {
				if (mod.plugins[key] == name) return true;
			}
			return false;
		},

		/**
		 * Verwerkt de meegegeven code zodat de opgegeven plugins beschikbaar zijn
		 *
		 * @param Array modules				de plugins die eerst geladen moeten worden
		 * @param function a_hFunction				de functie die daarna uitgevoerd moet worden
		 * @author Jan Niemantsverdriet
		 * @since 7 april 2019
		 */
		onLoaded : function (modules, callback, context) {
			if (modules.length == 0) callback.call(context);
			mod.toProcess.push( { 'modules' : modules, 'callback' : callback, 'context' : context });
			mod.processToDo();
		},

		/**
		 * Verwerkt de code die nog uitgevoerd moet worden als de plugins daar voor beschikbaar zijn
		 *
		 * @author Jan Niemantsverdriet
		 * @since 7 april 2019
		 */
		processToDo : function () {
			clearTimeout(mod.reviveToDo);

			if (mod.processing) {
				mod.reviveToDo = setTimeout(mod.processToDo, 2);
				return;
			}

			mod.processing = true;
			var remaining = [];
			var processed = false;

			mod.toDoCounter++;
			if (mod.toDoCounter > 1) return;

			for (var key = 0; key < mod.toProcess.length; key++) {
				var complete = true;

				// condities doorlopen
				for (var key2 = 0; key2 < mod.toProcess[key]['modules'].length; key2++) {
					if (!mod.isLoaded(mod.toProcess[key]['modules'][key2])) {
						complete = false;

						// indien nodig, javascript van plugin ophalen
						if (	mod.toProcess[key]['modules'][key2] &&
								mod.toProcess[key]['modules'][key2] != 'touch' &&
								!mod.javascriptLoaded(mod.pluginToJavascript(mod.toProcess[key]['modules'][key2]))) {
							mod.loadJavascript(mod.pluginToJavascript(mod.toProcess[key]['modules'][key2]));
						}
					}
				}

				// indien alle condities compleet zijn, code uitvoeren
				if (complete) {
					if (mod.toProcess[key]['context']) {
						mod.toProcess[key]['callback'].call(mod.toProcess[key]['context']);
					} else {
						mod.toProcess[key]['callback']();
					}
					processed = true;
				} else {
					remaining.push(mod.toProcess[key]);
				}
			}

			mod.toDoCounter--;
			mod.toProcess = remaining;

			// controleren of deze methode tijdens het bewerken nog is aangeroepen, zoja nogmaals starten
			if (processed || mod.toDoCounter > 0) {
				mod.toDoCounter = 0;
				mod.processToDo();
			}
			mod.processing = false;

        },

		/**
		 * Laad plugins
		 *
		 * @param Array plugins 		de te laden plugins
		 * @author Jan Niemantsverdriet
		 * @since 7 april 2019
		 */        
        loadPlugins(plugins) {
            for (var i in plugins) {
                mod.loadJavascript(mod.pluginToJavascript(plugins[i]));
            }
        },

		/**
		 * Voegt een javascript bestand toe (indien niet al aanwezig)
		 *
		 * @param String url 			de url naar het javascript bestand
		 * @author Jan Niemantsverdriet
		 * @since 7 april 2019
		 */
		loadJavascript : function (url) {

			if (typeof (url) === "undefined" || url == null || url == '') {
				mod.warn('Javascript bestand is niet meegegeven');
				return;
			}

			// kijken of het javascript bestand al geladen is
			for (var i = 0; i < mod.loadedScripts.length; i++) {
				if (mod.loadedScripts[i] == url) return;
			}

			// scrip makeren als geladen
			mod.loadedScripts.push(url);

			// nogmaals controleren of het bestand al bestaat
			if (mod.javascriptExists(url)) return;

			// script tag toevoegen aan de head van het document
			var script = document.createElement('script')
  			script.setAttribute("type", "text/javascript")
  			script.setAttribute("src", url);
  			document.getElementsByTagName("head")[0].appendChild(script);
		},

		/**
		 * Geeft aan of het opgegeven javascript element al bestaat binnen dit document
		 *
		 * @param String javascript  			de url van het javascript bestand
		 * @return boolean 							true = javascript bestand bestaat al
		 * @author Jan Niemantsverdriet
		 * @since 7 april 2019
		 */
		javascriptExists : function(javascript) {
			var scripts = document.getElementsByTagName('script');
			for (var i = 0; i < scripts.length; i++) {
				if (scripts[i].src.replace('https://', '').replace('http://', '').replace(window.location.host, '') == javascript) return true;
				if (scripts[i].src == javascript) return true;
			}
			return false;
		},

		/**
		 * Laad het javascript bestand indien aan de voorwaarden is voldaan
		 *
		 * @param String javascript				de url van het te laden javascript bestand
		 * @param Object modules				de bestanden die eerst geladen moeten zijn
		 * @author Jan Niemantsverdriet
		 * @since 7 april 2019
		 */
		loadJavascriptOn : function (javascript, modules ) {
			this.toLoad.push( { url : javascript, modules : modules } );
			this.processLoadList();
		},

		/**
		 * Laad een plugin
		 *
		 * @param String plugin     			de naam van de plugin
		 * @param Array modules				    de lijst van plugins die eerst geladen moeten worden
		 * @author Jan Niemantsverdriet
		 * @since 7 april 2019
		 */
		loadPluginOn : function (plugin, modules) {
			if (mod.isLoaded(plugin)) return;
			if (!plugin) {
				mod.warn('Geen plugin om te laden opgegeven');
				return;
			}
			for (var key in modules) {
				if (modules[key]) {
					modules[key] = this.pluginToJavascript(modules[key]);
				} else {
					mod.warn('Ongeldige module opgegeven');
				}
			}
			if(this.pluginToJavascript(plugin) !== null) {
				this.loadJavascriptOn(this.pluginToJavascript(plugin), modules);
			} else {
				mod.warn(plugin + ' ongeldige plugin');
			}
		},

		/**
		 * Geeft de naam van het javascript bestand horende bij de plugin
		 *
		 * @param String plugin					de naam van de plugin
		 * @return String|NULL						de url van het javascript bestand|Null als er een ongeldige plugin is meegegeven
		 * @author Jan Niemantsverdriet
		 * @since 7 april 2019
		 */
		pluginToJavascript : function (plugin) {
			if (typeof plugin == 'string') return '/javascripts/' + plugin + '.js';
			else {
				mod.warn('Meegegeven plugin was geen string maar ' + plugin);
				return null;
			}
		},

		/**
		 * Verwerkt de lijst met nog te laden bestanden
		 *
		 * @author Jan Niemantsverdriet
		 * @since 7 april 2019
		 */
		processLoadList : function () {
			for (var key in this.toLoad) {
				if (!this.javascriptLoaded(this.toLoad[key].url)) {
					var complete = true;
					for (var key2 in this.toLoad[key].modules) {
						if (!this.javascriptLoaded(this.toLoad[key].modules[key2])) {
							this.loadJavascript(this.toLoad[key].modules[key2]);
							complete = false;
						}

					}

					if (complete) {
						this.loadJavascript(this.toLoad[key].url);
					}
				}
			}
		},

		/**
		 * Geeft aan of een javascript bestand al geladen is
		 *
		 * @param String a_url						de url van het javascript bestand
		 * @return boolean 							true = javascript bestand is al geladen
		 * @author Jan Niemantsverdriet
		 * @since 7 april 2019
		 */
		javascriptLoaded : function (a_url) {
			for (var key in mod.loadedScripts) {
				if (mod.loadedScripts[key] == a_url) return true;
			}
			return false;
		},

		/**
		 * Logt een foutmelding
		 *
		 * @param String text					de tekst van de foutmelding
		 * @param String a_sMore					eventuele toelichting in tekst
		 * @author Jan Niemantsverdriet
		 * @since 2014-06-20
		 */
		warn : function(text) {
			console.log(text)
		}
	}
}
