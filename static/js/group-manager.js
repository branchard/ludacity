(function ($) {
    'use strict';

    // a faire sur un tableau, sur le tbody
    $.fn.list_groups = function () {
        var tbody = this;
        var add_button = $('#button-add-group');

        var bind_add_button = function () {
            add_button.click(function (event) {
                add_group_modal()
            });
        };


        var display_data = function () {

            // get all groups data from server
            $.getJSON("api/group/get-all", function (data) {

                // hide and delete loading indication
                $(tbody).hide().empty();

                // if no groups
                if (data.length == 0) {

                    // append text indicating 'no group' to tbody
                    $('<td>').addClass('text-center').attr('colspan', 5).text('Il n\'y a pas de groupe. Vous pouvez en ajouter en cliquant sur Ajouter.').appendTo($('<tr>')).appendTo(tbody);

                    // fade in
                    $(tbody).show(500);
                }
                else {
                    // to display the last adding on the top
                    data.reverse();

                    $.each(data, function () {
                        
                    });
                }
            });
        };

        bind_add_button();
        display_data();
        return this;
    };
}(jQuery));
