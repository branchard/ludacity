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
                            $('<td>').addClass('text-center').attr('colspan', 5).text('Il n\'y a pas d\'enseignants. Vous pouvez en ajouter en cliquant sur Ajouter.').appendTo($('<tr>')).appendTo(tbody);
                        }
                        else {
                            // pour afficher le dernier ajouter en haut
                            data.reverse();

                            $.each(data, function () {
                                //console.log(this);
                                //$('<tr/>').append($('<td/>')).text(this['username']).appendTo(tbody);
                                var group_list = '';
                                if (this['groups'].length == 0) {
                                    group_list += 'Sans classe';
                                }
                                else {
                                    var comma = '';
                                    $.each(this['groups'], function () {
                                        group_list += comma;
                                        group_list += this;
                                        if (comma == '') {
                                            comma = ', '
                                        }
                                    });
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

        var change_user_modal = function (this_button) {
            clean_change_modal();
            var this_modal = $('#change-modal');
            var user_id = this_button.data('user');
            //console.log(this);
            console.log('Change modal (user_id=' + user_id + ')');
            this_modal.data('user', user_id);
            // pour le bug de focus
            this_modal.on('shown.bs.modal', function () {
                $('#change-modal input[name="username"]').focus()
            });
            $.getJSON("api/teacher/get?id=" + user_id, function (data) {
                $('#change-modal input[name="username"]').val(data['username']);
                $('#change-modal input[name="first_name"]').val(data['first_name']);
                $('#change-modal input[name="last_name"]').val(data['last_name']);
                $('#change-modal input[name="password"]').val(data['password']);

                // on affiche toutes les groups dispo
                var select_group = this_modal.find('select[name="groups"]');
                //select_group.selectpicker();
                //console.log(select_group[0]);
                $.getJSON("api/group/get-all", function (data) {
                    console.log(data);
                    $.each(data, function () {
                        $("<option>").text(this['name']).appendTo(select_group);
                    });
                }).complete(function () {

                    select_group.selectpicker('val', data['groups']);
                    select_group.selectpicker('refresh');
                });

                /*$.each(data['groups'], function () {
                 $("<option>").text(this).appendTo(select_group);
                 select_group.selectpicker('val', 'Mustard');
                 });*/
                console.log('activation de select picker');
                select_group.selectpicker();

                // bind save button
                var btn1 = $('#change-modal #save-btn').attr('data-user', data['id']);
                btn1.click(function (event) {
                    // TODO indication de chargement sur le bouton
                    var this_modal = $('#change-modal');
                    var groups_to_send = [];
                    $.each(this_modal.find('select[name="groups"]').find('option:selected'), function()
                    {
                        groups_to_send.push($(this).val());
                    });
                    change_user($(this).data('user'),
                        this_modal.find('input[name="username"]').val(),
                        this_modal.find('input[name="first_name"]').val(),
                        this_modal.find('input[name="last_name"]').val(),
                        groups_to_send,
                        this_modal.find('input[name="password"]').val()
                    );
                    $.each(this_modal.find('select[name="groups"]').find('option:selected'), function()
                    {
                        console.log($(this).val());
                    });
                    //console.log(this_modal.find('select[name="groups"]').find('option:selected')[0]);
                    this_modal.modal('hide');
                    console.log('save fini');
                });

            }).complete(function () {
                console.log("get json complete");
                this_modal.modal('show');
            });


        };

        var change_user = function (id, username, first_name, last_name, groups, password) {
            console.log('Change user: ' + id + ' ' + username + ' ' + first_name + ' ' + last_name + ' ' + groups + ' ' + password);
            $.ajax({
                url: 'api/teacher/change',
                type: 'POST',
                data: JSON.stringify({
                    'id': id,
                    'username': username,
                    'first_name': first_name,
                    'last_name': last_name,
                    'groups': groups,
                    'password': password
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                complete: function () {
                    console.log('complete');
                    load_end_display_data();
                }
            });
        };

        var clean_change_modal = function () {
            var this_modal = $('#change-modal');
            console.log('cleanup change modal');

            this_modal.find('input[name="username"]').val('');
            this_modal.find('input[name="first_name"]').val('');
            this_modal.find('input[name="last_name"]').val('');
            this_modal.find('input[name="password"]').val('');

            //$('#change-modal').find('select[name="groups"]').selectpicker();
            console.log('netoyage de select picker');
            this_modal.find('select[name="groups"]').empty();

            this_modal.find('#save-btn').unbind().removeData();
        };

        load_end_display_data();

        return this;
    };

    $.fn.bindButtonAddUser = function () {
        this.each(function () {
            $(this).click(function (event) {
                $('#add-modal').modal('show');
            });
            // TODO
        });
        return this;
    };
}(jQuery));
