"use strict";

// navigatie klasse
if (!mod.form) {
    mod.onLoaded(['vars'], () => {
        mod.form = {

            /**
             * Maakt een nieuw formulier en plaatst het
             * 
             * @param {Object} model                        het datamodel voor het formulier
             * @param {Object} formparams                   parameters voor het maken van het formulier
             * @since 8 april 2019
             * @author Jan Niemantsverdriet
             */
            create(model, formparams, values) {

                // formulier maken
                var form = document.createElement('form');

                // prefill aan de waarden toevoegen
                if (formparams.values__prefill) {
                    if (!values) values = {};
                    for (var prefillname in formparams.values__prefill) {
                        if (!(prefillname in values) && formparams.values__prefill[prefillname] != '_') {
                            values[prefillname] = formparams.values__prefill[prefillname];
                        }
                    }
                }

                // velden toevoegen
                for (var i in model) {

                    var params = model[i];
                    var name = params.field__name;

                    // crud tests
                    if (params.crud__display && params.crud__display != 'all' && params.crud__display != formparams.crud__display) continue;

                    // type goedzetten
                    if (!params.field__type) params.field__type = 'shorttext';
                    
                    // veld maken
                    var wrapClass = 'form-group';
                    switch(params.field__type) {
                        case 'image':
                            
                            // bestandsveld zelf
                            var field = document.createElement('input');
                            field.addEventListener('change', () => { mod.form.fileChangeInputText(name) });
                            field.addEventListener('change', () => { mod.form.fileChangeState(name) });
                            field.id = 'file_input_file_' + name;
                            field.className = 'none';
                            field.type = 'file';

                            // wrapper
                            var wrapClass = 'form-group file_input_div';
                            var inputWrapper = document.createElement('div');
                            inputWrapper.className = 'file_input';

                            // uploadknop
                            var label = document.createElement('label');
                            label.className = 'image_input_button mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-js-ripple-effect mdl-button--colored';
                            var icon = document.createElement('i');
                            icon.className='material-icons';
                            icon.innerHTML = 'file_upload';
                            label.appendChild(icon);
                            label.appendChild(field);
                            inputWrapper.appendChild(label);

                            // weergave bestandsnaam
                            var textDiv = document.createElement('div');
                            textDiv.id = 'file_input_text_div_' + name;
                            textDiv.className = 'mdl-textfield mdl-js-textfield textfield-demo';
                            var fakeInput = document.createElement('input');
                            fakeInput.className = 'file_input_text mdl-textfield__input'
                            fakeInput.type = 'text';
                            fakeInput.disabled = 'disabled';
                            fakeInput.readonly = 'readonly';
                            fakeInput.id = 'file_input_text_' + name;
                            textDiv.appendChild(fakeInput);
                            var fakeLabel = document.createElement('label');
                            fakeLabel.className = 'mdl-textfield__label';
                            fakeInput.for = 'file_input_text_' + name;
                            textDiv.appendChild(fakeInput);
                            inputWrapper.appendChild(textDiv);
                            var toAdd = inputWrapper;
                            break;
                        case 'select':

                            // veld maken
                            var field = document.createElement('select');
                            field.name = name;

                            // opties toevoegen
                            if (params.select__options) {
                                if (typeof params.select__options === 'string') params.select__options = JSON.parse(params.select__options);
                                for (var key in params.select__options) {
                                    var option = document.createElement('option');
                                    option.value = key;
                                    option.innerHTML = params.select__options[key];
                                    var run = false;
                                    if (values && values[name] && values[name] == key) {
                                        run = true;
                                        option.selected = "selected";
                                    }
                                    field.appendChild(option);
                                    if (run && params.run__onchange) {
                                        var run = function() { eval(params.run__onchange) };
                                        run.call(field);
                                    }
                                }
                            }

                            // toe te voegen
                            var toAdd = field;
                            break;

                        case 'text':

                            // veld maken
                            var field = document.createElement('textarea');
                            field.name = name;

                            // placeholder
                            if (params.field__placeholder) {
                                field.placeholder = params.field__placeholder;
                            }

                            // waarde
                            if (values && values[name]) {
                                field.innerHTML = values[name];
                            }

                            // toe te voegen
                            var toAdd = field;
                            break;
                        case 'checkbox':
                            
                            // veld maken
                            var field = document.createElement('input');
                            field.type = "checkbox";
                            field.name = name;

                            // hulpelementen voor opmaak
                            var label = document.createElement('label');
                            var check = document.createElement('i');
                            var labelText = document.createTextNode(params.form__label);
                            var input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = 'checkbox-' + name;
                            input.value = 'true';
                            delete params.form__label;
                            check.className = 'helper';
                            label.appendChild(input);
                            label.appendChild(field);
                            label.appendChild(check);
                            label.appendChild(labelText);
                            wrapClass = 'checkbox';

                            // waarde instellen
                            if (values && values[name]) field.checked = "checked";
                            if (values && values[name]) field.value = "true";

                            // toe te voegen
                            var toAdd = label;
                            break;
                        case 'username':

                            // veld maken
                            var field = document.createElement('input');
                            field.autocomplete = 'username';
                            field.name = name;

                            // placeholder
                            if (params.field__placeholder) {
                                field.placeholder = params.field__placeholder;
                            }

                            // waarde
                            if (values && values[name]) {
                                field.value = values[name];
                            }
                            
                            // toe te voegen
                            var toAdd = field;
                            break;
                        case 'password':

                            // veld maken
                            var field = document.createElement('input');
                            field.type = 'password';
                            field.autocomplete = 'current-password';
                            field.name = name;

                            // placeholder
                            if (params.field__placeholder) {
                                field.placeholder = params.field__placeholder;
                            }
                            
                            // toe te voegen
                            var toAdd = field;
                            break;
                        case 'email':

                            // veld maken
                            var field = document.createElement('input');
                            field.type = 'email';
                            field.name = name;

                            // placeholder
                            if (params.field__placeholder) {
                                field.placeholder = params.field__placeholder;
                            }

                            // waarde
                            if (values && values[name]) {
                                field.value = values[name];
                            }
                            
                            // toe te voegen
                            var toAdd = field;
                            break;
                        default:

                            // veld maken
                            var field = document.createElement('input');
                            field.name = name;

                            // placeholder
                            if (params.field__placeholder) {
                                field.placeholder = params.field__placeholder;
                            }

                            // waarde
                            if (values && values[name]) {
                                field.value = values[name];
                            }
                            
                            // toe te voegen
                            var toAdd = field;
                    }

                    // onchange instellen
                    if (params.run__onchange) {
                        var onchange = params.run__onchange;
                        field.onchange = function() { eval(onchange) };
                    }
                    
                    // wrapper maken
                    var wrapper = document.createElement('div');
                    wrapper.className = wrapClass;
                    wrapper.id = 'wrapper_' + name;
                    wrapper.appendChild(toAdd);

                    // prefill gedrag
                    if (formparams.values__prefill && formparams.values__prefill[name]) {
                        if (params.behaviour__prefilled) {
                            switch(params.behaviour__prefilled) {
                                case 'hide':
                                    wrapper.style.display = "none";
                            }
                        }
                    } 

                    // show script
                    if (params.hideon__script) {
                        wrapper.dataset['hidden'] = params.hideon__script;
                        if (mod.vars.evaluate(wrapper, 'hidden')) wrapper.hidden = 'hidden';
                    }

                    // label maken
                    if (params.form__label) {
                        var label = document.createElement('label');
                        label.innerHTML = params.form__label;
                        label.className = 'control-label';
                        label.for = 'input';
                        wrapper.appendChild(label);
                    }

                    // line maken
                    var line = document.createElement('i');
                    line.className = 'bar';
                    wrapper.appendChild(line);

                    // veld aan formulier toevoegen
                    form.appendChild(wrapper);
                }

                // submit knop toevoegen
                var submit = document.createElement('button');
                submit.type = 'submit';
                submit.className = 'button';
                var label = document.createElement('span');
                label.innerHTML = formparams.submit__label ? formparams.submit__label : 'Verstuur';
                submit.appendChild(label);
                var buttondiv = document.createElement('div');
                buttondiv.className = 'button-container';
                buttondiv.appendChild(submit);
                form.appendChild(buttondiv);

                // submit van formulier instellen
                if (formparams.post__url) form.action = formparams.post__url;
                jQuery(form).submit(mod.form.submitForm);

                // formulier plaatsen
                document.getElementById('form').appendChild(form);
            },

            /**
             * Wijzigt de tekst van het bestand in een bestandsveetld
             * 
             * @param {String} name                     de naam van het bestandsveld
             * @since 8 april 2019
             * @author Jan Niemantsverdriet
             */
            fileChangeInputText(name) {
                var fileInput = document.getElementById('file_input_file_' + name);
                var fileInputText = document.getElementById('file_input_text_' + name);
                var value = fileInput.value;
                var i;
                if (value.lastIndexOf('\\')) {
                    i = value.lastIndexOf('\\') + 1;
                } else if (value.lastIndexOf('/')) {
                    i = value.lastIndexOf('/') + 1;
                }
                alert(value.slice(i, value.length));
                fileInputText.value = value.slice(i, value.length);
            },

            /**
             * Wijzigt de focus van een bestandsveld
             * 
             * @param {String} name                     de naam van het bestandsveld
             * @since 8 april 2019
             * @author Jan Niemantsverdriet
             */
            fileChangeState(name) {
                var fileInputTextDiv = document.getElementById('file_input_text_div_' + name);
                var fileInputText = document.getElementById('file_input_text_' + name);

                if (fileInputText.value.length != 0) {
                    if (!fileInputTextDiv.classList.contains("is-focused")) {
                        fileInputTextDiv.classList.add('is-focused');
                    }
                } else {
                    if (fileInputTextDiv.classList.contains("is-focused")) {
                        fileInputTextDiv.classList.remove('is-focused');
                    }
                }
            },

            /**
             * Geeft de waarde van het opgegeven veld
             * 
             * @param {mixed} field                     het veld of het id van het veld
             * @return {mixed}                          de waarde van het veld (null indien niet gevonden)
             * @since 11 april 2019
             * @author Jan Niemantsverdriet
             */
            getValue(field) {

                // veld opzoeken
                if (field instanceof String) field = document.getElementById(field);
                if (!field) return null;

                switch (field.tagName) {
                    case 'select':
                        return field.options[field.selectedIndex].value;
                    default:
                        return field.value;
                }
            },

            /**
             * Verstuurd de data van het formulier
             * 
             * @param {Event} event                     het submit event
             * @since 8 april 2019
             * @author Jan Niemantsverdriet
             */
            submitForm(event) {
                
                // formulier controleren
                var form = event.target;
                if (!form.action) {
                    event.preventDefault();
                    return;
                }

                // data formulier
                var data = {};
                var raw = jQuery(form).serializeArray();
                for (var i in raw) {
                    data[raw[i].name] = raw[i].value;
                }

                // data versturen
                jQuery.ajax({
                    type        : 'POST',
                    url         : form.action,
                    data        : data,
                    dataType    : 'json',
                    encode      : true
                }).done(mod.form.storeResponse);

                // voorkomen dat de pagina herladen wordt
                event.preventDefault();
            },

            /**
             * Reactie van de server na het opslaan tonen
             * 
             * @param {Object} data                     de data die terugkwam van de server
             * @since 8 april 2019
             * @author Jan Niemantsverdriet
             */
            storeResponse(data, textStatus, request) {

                mod.onLoaded(['system'], () => {
                    
                    // standaard acties afvangen
                    mod.system.handleServerResponse(data, textStatus, request);

                    // oude errors opruimen
                    jQuery('form .error').removeClass('error');
                    jQuery('form .error_message').remove();
    
                    // veld errors
                    if (data.error__fields) {
                        for (var field in data.error__fields) {
                            var wrapper = document.getElementById('wrapper_' + field);
                            if (wrapper) {
                                jQuery(wrapper).addClass('error');
                                
                                var errorMessage = document.createElement('p');
                                errorMessage.className = 'error_message';
                                errorMessage.innerHTML = data.error__fields[field];
                                wrapper.appendChild(errorMessage);
                            }
                        }
                    }
    
                    // weergave van standaard meldingen
                    mod.onLoaded(['message'], () => { mod.message.inline('form', data) });
                });
            }
        }

        mod.markAsLoaded('form');
    });
}