(function ($) {
    'use strict';

    $.fn.list_activities = function () {
        var tbody = this;
        var add_button = $('#button-add-activity');

        var bind_add_button = function () {
            console.log('bind add button');
            add_button.click(function (event) {
                //add_activity_modal()
            });
        };

        var display_data = function () {
            console.log('display all data');

            $.getJSON("/api/activity/get-all", function (data) {
                $(tbody).hide().empty();

                if (data.length == 0) {

                    // append text indicating 'no group' to tbody
                    $('<td>').addClass('text-center').attr('colspan', 5).text('Vous n\'avez pas encore d\'activités. Vous pouvez en créer de nouvelles en cliquant sur le bouton "Créer une activité".').appendTo($('<tr>')).appendTo(tbody);

                    // fade in
                    $(tbody).show(500);
                }
                else {
                    // to display the last adding on the top
                    data.reverse();

                    $.each(data, function () {
                        var buttons_row = $('<td>').addClass('last');

                        // bouton modifier
                        var btn1 = $('<a>').addClass('btn btn-primary btn-xs').data('group', this['id']).append($('<span>').addClass('glyphicon glyphicon-pencil'))
                            .append(' Modifier');
                        btn1.click(function (event) {
                            change_group_modal($(this))
                        });

                        // Bouton supprimer
                        var btn2 = $('<a>').addClass('btn btn-danger btn-xs').data('group', this['id']).append($('<span>').addClass('glyphicon glyphicon-remove'))
                            .append(' Supprimer');

                        btn2.delete_modal(function (event) {
                                console.log(btn2[0]);
                                delete_group(btn2.data('group'));
                            },
                            'Etes-vous sûr de vouloir supprimer cette activité ?'
                        );

                        var group_list = '';
                        if (this['groups'].length == 0) {
                            group_list += 'aucune';
                        }
                        else {
                            var comma = '';
                            $.each(this['groups'], function () {
                                group_list += comma;
                                group_list += this['name'];
                                if (comma == '') {
                                    comma = ', '
                                }
                            });
                        }

                        // création du btn group
                        $('<div>').addClass('btn-group').append(btn1).append(btn2).appendTo(buttons_row);
                        var date = new Date(this['date']['year'], this['date']['month'] - 1, this['date']['day'], this['date']['hour'], this['date']['minute'], 1);
                        // on affiche la ligne du tableau
                        $('<td>').text(this['title'])
                            .add($('<td>').text(group_list))
                            .add($('<td>').text('le {0} {1} {2} {3} à {4}h{5}'.format(
                                date.getDayName(),
                                date.getDate(),
                                date.getMonthName(),
                                date.getFullYear(),
                                date.getHours(),
                                date.getMinutes()
                            )))
                            .add(buttons_row)
                            .appendTo($('<tr>').appendTo(tbody));
                    });
                    $(tbody).show(500);
                }
            });
        };

        var add_activity_modal = function () {
            clean_add_activity_modal();
            var this_modal = $('#add-modal');

            // set modal title
            this_modal.find('.modal-title').text('Création d\'une activité');

            // pour le bug de focus
            this_modal.on('shown.bs.modal', function () {
                $(this).find('input[name="title"]').focus();
            });

            // bind save button
            var btn1 = this_modal.find('#save-btn');
            btn1.click(function (event) {
                // TODO indication de chargement sur le bouton
                var this_modal = $('#add-modal');

                add_activity(
                    this_modal.find('input[name="title"]').val(),
                    this_modal.find('input[name="mult"]').is(':checked'),
                    this_modal.find('input[name="interactive"]').is(':checked')
                );

                //console.log(this_modal.find('select[name="groups"]').find('option:selected')[0]);
                //this_modal.modal('hide');
                console.log('save fini');
            });


            console.log("get json complete");
            this_modal.modal('show');

        };

        var add_activity = function (title, mult, interactive) {
            console.log('Add Activity: ' + title);
            $.ajax({
                url: '/api/activity/add',
                type: 'PUT',
                data: JSON.stringify({
                    'title': title,
                    'multi_attempts': mult,
                    'interactive_correction': interactive

                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                complete: function () {
                    console.log('complete');
                    window.location = 'edit-activity/latest'; // TODO warning
                    //display_data();
                }
            });
        };

        var clean_add_activity_modal = function () {
            var this_modal = $('#add-modal');
            console.log('cleanup add modal');

            this_modal.find('input[name="title"]').val('');
            this_modal.find('input[name="mult"]').prop('checked', false);
            this_modal.find('input[name="interactive"]').prop('checked', false);

            this_modal.find('.modal-title').empty();

            this_modal.find('#save-btn').unbind().removeData();
        };

        bind_add_button();
        display_data();

        return this;
    };
}(jQuery));