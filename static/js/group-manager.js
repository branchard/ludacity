(function ($) {
    'use strict';

    // a faire sur un tableau, sur le tbody
    $.fn.list_groups = function () {
        var tbody = this;
        var add_button = $('#button-add-group');

        var bind_add_button = function () {
            console.log('bind add button');
            add_button.click(function (event) {
                add_group_modal()
            });
        };


        var display_data = function () {

            console.log('display all data');

            // get all groups data from server
            $.getJSON("/api/group/get-all", function (data) {
                console.log('get JSON');
                // hide and delete loading indication
                $(tbody).hide().empty();

                // if no groups
                if (data.length == 0) {

                    // append text indicating 'no group' to tbody
                    $('<td>').addClass('text-center').attr('colspan', 5).text('Il n\'y a pas de classe. Vous pouvez en ajouter en cliquant sur Ajouter.').appendTo($('<tr>')).appendTo(tbody);

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
                        var btn2 = $('<a>').addClass('btn btn-danger btn-xs').data('group', this['id']).append($('<span>').addClass('glyphicon glyphicon-minus'))
                            .append(' Supprimer');

                        btn2.delete_modal(function (event) {
                                console.log(btn2[0]);
                                delete_group(btn2.data('group'));
                            },
                            'Etes-vous sûr de vouloir supprimer la classe ?'
                        );

                        // création du btn group
                        $('<div>').addClass('btn-group').append(btn1).append(btn2).appendTo(buttons_row);

                        // on affiche la ligne du tableau
                        $('<td>').text(this['name'])
                            .add(buttons_row)
                            .appendTo($('<tr>').appendTo(tbody));
                    });
                    $(tbody).show(500);
                }
            });
        };

        var change_group_modal = function (this_button) {
            clean_change_group_modal();
            var this_modal = $('#change-modal');

            // get group id
            var group_id = this_button.data('group');

            // set modal title
            this_modal.find('.modal-title').text('Modification d\'une classe');

            this_modal.data('group', group_id);

            // pour le bug de focus
            this_modal.on('shown.bs.modal', function () {
                $(this).find('input[name="name"]').focus()
            });

            // get group name and set it in input
            $.getJSON("/api/group/get?id=" + group_id, function (data) {
                this_modal.find('input[name="name"]').val(data['name']);


                // bind save button
                var btn1 = this_modal.find('#save-btn').data('group', data['id']);
                btn1.click(function (event) {
                    // TODO indication de chargement sur le bouton
                    var this_modal = $('#change-modal');
                    change_group($(this).data('group'),//group id
                        this_modal.find('input[name="name"]').val()
                    );
                    this_modal.modal('hide');
                    console.log('save fini');
                });

            }).complete(function () {
                console.log("get json complete");
                this_modal.modal('show');
            });

        };

        var clean_change_group_modal = function () {
            var this_modal = $('#change-modal');
            console.log('cleanup change modal');

            this_modal.find('input[name="name"]').val('');

            this_modal.find('.modal-title').empty();

            this_modal.find('#save-btn').unbind().removeData();
        };

        var change_group = function (id, name) {
            console.log('Change group: ' + id + ' ' + name);
            $.ajax({
                url: '/api/group/change',
                type: 'POST',
                data: JSON.stringify({
                    'id': id,
                    'name': name
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                complete: function () {
                    console.log('complete');
                    display_data();
                }
            });
        };

        var add_group_modal = function () {
            clean_change_group_modal();
            var this_modal = $('#change-modal');

            // set usermodal title
            this_modal.find('.modal-title').text('Ajout d\'une classe ');

            //console.log(this);
            // pour le bug de focus
            this_modal.on('shown.bs.modal', function () {
                $(this).find('input[name="name"]').focus()
            });

            // bind save button
            var btn1 = this_modal.find('#save-btn');
            btn1.click(function (event) {
                // TODO indication de chargement sur le bouton
                var this_modal = $('#change-modal');

                add_group(this_modal.find('input[name="name"]').val());

                //console.log(this_modal.find('select[name="groups"]').find('option:selected')[0]);
                this_modal.modal('hide');
                console.log('save fini');
            });


            console.log("get json complete");
            this_modal.modal('show');

        };

        var add_group = function (name) {
            console.log('Add group: ' + name);
            $.ajax({
                url: '/api/group/add',
                type: 'PUT',
                data: JSON.stringify({
                    'name': name
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                complete: function () {
                    console.log('complete');
                    display_data();
                }
            });
        };

        var delete_group = function (id) {
            console.log('Delete group: ' + id);
            $.ajax({
                url: '/api/group/delete',
                type: 'DELETE',
                data: JSON.stringify({
                    'id': id
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                complete: function () {
                    console.log('complete');
                    display_data();
                }
            });
        };

        bind_add_button();
        display_data();
        return this;
    };
}(jQuery));
