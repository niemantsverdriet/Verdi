"use strict";

// display klasse
if (!mod.display) {
    mod.display = {

        init() {
            jQuery(window).on("scroll", function () {
                if (jQuery(this).scrollTop() > 30) {
                    jQuery("#top_bar").addClass("shadow");
                }
                else {
                    jQuery("#top_bar").removeClass("shadow");
                }
            });
        }
    }

    mod.markAsLoaded('display');
    mod.display.init();
}