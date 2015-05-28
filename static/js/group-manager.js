(function ($) {
    'use strict';

    // a faire sur un tableau, sur le tbody
    $.fn.list_groups = function () {
        var input = this;

        $('#button-add-group').click(function (event) {
            add_group_modal()
        });

        var display_data = function () {

        };

        display_data();
        return this;
    };
}(jQuery));
