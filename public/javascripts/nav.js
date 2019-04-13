"use strict";

// navigatie klasse
if (!mod.nav) {
    mod.nav = {

        to(url) {
            document.location = url;
        }
    }

    mod.markAsLoaded('nav');
}