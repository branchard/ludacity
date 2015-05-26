(function ($) {
    'use strict';

    // a faire sur un tableau, sur le tbody
    $.fn.manageUserList = function (userOptions) {
        this.each(function () {
            $('<tr><td></td><tr/>').appendTo(this);
        });
        return this;
    };

    // a faire sur un tableau, sur le tbody
    $.fn.listUsers = function () {
        var input = this;
        var load_end_display_data = function () {
            input.each(function () {
                    var tbody = this;
                    $.getJSON("api/teacher/get-all", function (data) {
                        // pour supprimer l'affichage du chargement
                        $(tbody).empty();
                        if (data.length == 0) {
                            $('<td>').addClass('text-center').attr('colspan', 5).text('Il n\'y a pas d\'enseignants').appendTo($('<tr>')).appendTo(tbody);
                        }
                        else {
                            // pour afficher le dernier ajouter en haut
                            data.reverse();

                            $.each(data, function () {
                                console.log(this);
                                //$('<tr/>').append($('<td/>')).text(this['username']).appendTo(tbody);
                                var group_list = '';
                                if (this['groups'].length == 0) {
                                    group_list += 'Sans classe';
                                }
                                else {

                                }

                                var buttons_row = $('<td>').addClass('last');
                                // <a class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-pencil"></span> Modifier</a>
                                var btn1 = $('<a>').addClass('btn btn-primary btn-xs').attr('data-user', this['id']).append($('<span>').addClass('glyphicon glyphicon-pencil'))
                                    .append(' Modifier');
                                btn1.click(function (event) {
                                    change_user_modal($(this))
                                });

                                var btn2 = $('<a>').addClass('btn btn-danger btn-xs').append($('<span>').addClass('glyphicon glyphicon-minus'))
                                    .append(' Supprimer');
                                btn2.click(function (event) {
                                    console.log('delete');
                                });

                                // création du btn group
                                $('<div>').addClass('btn-group').append(btn1).append(btn2).appendTo(buttons_row);

                                $('<td>').text(this['username'])
                                    .add($('<td>').text(this['first_name']))
                                    .add($('<td>').text(this['last_name']))
                                    .add($('<td>').text(group_list))
                                    .add(buttons_row)
                                    .appendTo($('<tr>').appendTo(tbody));
                            });
                        }

                    });
                }
            );
        };

        var change_user_modal = function(this_button)
        {
            console.log(this_button);
            var this_modal = $('#change-modal');
            var user_id = this_button.data('user');
            //console.log(this);
            console.log('Change modal (user_id=' + user_id + ')');
            this_modal.data('user', user_id);
            this_modal.children('input[name="username"]').val();
            this_modal.modal({'show': true});
        };

        var change_user = function (id, username, first_name, last_name, password) {
            $.ajax({
                url: 'api/teacher/change',
                type: 'POST',
                data: JSON.stringify({
                    'id': id,
                    'username': username,
                    'first_name': first_name,
                    'last_name': last_name,
                    'password': password
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function () {
                    $('#change-modal').modal({'show': false});
                    load_end_display_data();
                }
            });
        };

        var update_change_modal = function()
        {

        };

        change_user(4, 'jacques.prevert', 'Jacques', 'Prévert', 'azerty');
        load_end_display_data();

        return this;
    };

    $.fn.bindButtonAddUser = function () {
        this.each(function () {

        });
        return this;
    };
}(window.jQuery));
