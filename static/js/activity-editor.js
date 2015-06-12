// jQuery plugin
(function ($) {

    'use strict';

    $.fn.activity_editor = function () {
        // GLOBALS OBJECTS
        var activity;

        // Configuration
        var AUTO_SAVE_INTERVAL = 240 * 1000;// expressed in miliseconds

        var ACTIVITY_AJAX_GET_URL = "/api/activity/get";
        var ACTIVITY_AJAX_PUT_URL = "/api/activity/add";
        var ACTIVITY_AJAX_POST_URL = "/api/activity/change";

        var GROUPS_AJAX_GET_ALL_URL = "/api/group/get-all";

        var UPLOAD_FILE_URL = "/api/upload-file";

        // DOM jQuery elements
        var ACTIVITY_INDICATOR = $('#activity-indicator');
        var SAVE_BUTTON = $('#save-button');
        var PREVIEW_BUTTON = $('#preview-button');
        var ACTIVITY_HEADER = $('#activity-header');
        {
            var TITLE_FIELD = ACTIVITY_HEADER.find('input[name="title"]');
            var GROUPS_SELECTOR = ACTIVITY_HEADER.find('select[name="groups"]');
            var MULTI_ATTEMPTS_CHECKBOX = ACTIVITY_HEADER.find('input[name="mult"]');
            var INTERACTIVE_CORRECTION_CHECKBOX = ACTIVITY_HEADER.find('input[name="interactive"]')
        }

        var EXERCISE_LIST = $('.edit-activity-exercises');
        {
            EXERCISE_LIST.prevent_accordion_glitch_before = function () {
                $(this).css({"min-height": 0});
            };

            EXERCISE_LIST.prevent_accordion_glitch_after = function () {
                $(this).css({"min-height": $(this).innerHeight()});
            };

            EXERCISE_LIST.prevent_accordion_glitch = function () {
                EXERCISE_LIST.prevent_accordion_glitch_before();
                EXERCISE_LIST.prevent_accordion_glitch_after();
            };

            EXERCISE_LIST.init = function () {
                $(this).accordion({
                    collapsible: true,
                    active: false,
                    heightStyle: "content",
                    header: "> div > .group-header",
                    icons: {
                        header: "glyphicon glyphicon-chevron-right",
                        activeHeader: "glyphicon glyphicon-chevron-down"
                    },
                    // prevent scroll jump/glitch
                    beforeActivate: this.prevent_accordion_glitch_before,
                    activate: this.prevent_accordion_glitch_after
                }).sortable({
                    axis: "y",
                    handle: ".group-header",
                    //placeholder: "sortable-placeholder",
                    //revert: 150,
                    stop: function (event, ui) {
                        // IE doesn't register the blur when sorting
                        // so trigger focusout handlers to remove .ui-state-focus
                        ui.item.children(".group-header").triggerHandler("focusout");

                        // Refresh accordion to handle new order
                        $(this).accordion("refresh");
                    },

                    update: activity.sort_exercise_array
                });
                this.prevent_accordion_glitch_after();
            };
        }

        var NEW_EXERCISE_BUTTON = $('#new-exercise-button');

        var CHOSE_EXERCISE_MODAL = $('#chose-exercise-type-modal');


        // Objects constructors --

        /*
         * Activity constructor
         *
         * arg id: int
         * arg title: String
         * arg groups: Array<Group>
         * arg multi_attempts: boolean
         * arg interactive_correction: boolean
         */
        var Activity = function (id) {
            this.id = id;
            this.title = undefined;
            this.groups = []; // allowed groups
            this.checked_groups = [];
            this.multi_attempts = undefined;
            this.interactive_correction = undefined;
            this.exercises = [];


            // methods

            /*
             * Initialisation function
             */
            this.init = function () {
                EXERCISE_LIST.init();

                this.pull();

                // bind buttons
                // TODO il faut penser à faite un indicateur de sauvegarde en cours ou terminée
                SAVE_BUTTON.click(function () {
                    var $btn = $(this);
                    $btn.button('loading');
                    activity.push();
                    $btn.button('reset');
                });

                NEW_EXERCISE_BUTTON.click(function () {
                    activity.new_exercise();
                });

                // start auto save loop
                setInterval(function () {
                    activity.push();
                }, AUTO_SAVE_INTERVAL);
            };

            /*
             * PUT or POST activity
             */
            this.push = function () {
                activity.update_from_fields();
                // Checks if this is a new activity
                if (this.id == undefined) {
                    console.log('Put activity: ' + this.title);
                    $.ajax({
                        url: ACTIVITY_AJAX_PUT_URL,
                        type: 'PUT',
                        data: JSON.stringify({
                            'title': this.title,
                            'groups': this.checked_groups,
                            'multi_attempts': this.multi_attempts,
                            'interactive_correction': this.interactive_correction
                        }),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json"
                    });

                    // get id
                    var _this = this;
                    $.getJSON(ACTIVITY_AJAX_GET_URL + '?latest', function (data) {
                        _this.id = data['id'];
                    });
                    history.replaceState({}, "", this.id);
                    this.pull();
                    this.push();
                }
                else {
                    console.log('Post activity: ' + this.id + ': ' + this.title);
                    var exercises = [];
                    $.each(this.exercises, function () {
                        exercises.push({
                            'index': this.index,
                            'title': this.title,
                            'type': this.type.bd_name,
                            'exercise_json': this.exercise_json,
                            'correction_elements': this.correction_elements
                        });
                    });
                    $.ajax({
                        url: ACTIVITY_AJAX_POST_URL,
                        type: 'POST',
                        data: JSON.stringify({
                            'id': this.id,
                            'title': this.title,
                            'groups': this.checked_groups,
                            'multi_attempts': this.multi_attempts,
                            'interactive_correction': this.interactive_correction,
                            'exercises': exercises
                        }),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function () {
                            toastr.success('Activité sauvegardée !')
                        },
                        error: function () {
                            toastr.error('L\'activité n\'a pu être sauvegardée')
                        }

                    });
                }

            };

            /*
             * Update from server
             */
            this.pull = function () {
                console.log('get data from server');
                var _this = this;
                if (this.id != undefined) {
                    $.getJSON(ACTIVITY_AJAX_GET_URL + '?id=' + this.id, function (data) {
                        console.log(data);
                        _this.title = data['title'];
                        _this.checked_groups = data['groups'];
                        _this.multi_attempts = data['multi_attempts'];
                        _this.interactive_correction = data['interactive_correction'];
                        _this.exercises = [];
                        $.each(data['exercises'], function () {
                            var this_handler_inner = this;
                            var type = undefined;
                            $.each(exercise_types, function () {
                                if (this.bd_name == this_handler_inner['type']) {
                                    type = this;
                                    return true;
                                }
                            });
                            var ex = new Exercise(
                                this['index'],
                                this['title'],
                                type,
                                this['exercise_json']
                            );
                            ex.init();
                            _this.exercises.push(ex);
                        });
                    });
                }
                else {
                    console.log('It\'s a new activity');
                }
                this.pull_groups();
                this.update_fields();
            };

            /*
             * Update groups
             */
            this.pull_groups = function () {
                console.log('pull groups');
                this.groups = [];
                var _this = this;
                $.getJSON(GROUPS_AJAX_GET_ALL_URL, function (data) {
                    $.each(data, function () {
                        _this.groups.push(new Group(this['name'], this['id']));
                    });
                });
                console.log('pull groups done');
                this.update_fields();
            };

            /*
             * Update from fields
             */
            this.update_from_fields = function () {
                console.log('update from fields');

                this.title = TITLE_FIELD.val();
                this.groups = [];
                this.checked_groups = [];
                var _this = this;
                $.each(GROUPS_SELECTOR.find('option:selected'), function () {
                    if ($(this).val() != 'Aucune') {
                        _this.checked_groups.push({'name': $(this).val()});
                    }
                });
                this.multi_attempts = MULTI_ATTEMPTS_CHECKBOX.is(':checked');
                this.interactive_correction = INTERACTIVE_CORRECTION_CHECKBOX.is(':checked');

                console.log(this.exercises);
                $.each(this.exercises, function () {
                    this.update_from_fields();
                });

                console.log('done.');
            };

            /*
             * Update fields
             */
            this.update_fields = function () {
                console.log('update fields');
                TITLE_FIELD.val(this.title);
                // TODO groups
                GROUPS_SELECTOR.empty();
                var _this = this;
                $.each(this.groups, function () {
                    var checked = false;
                    var __this = this;
                    $.each(_this.checked_groups, function () {
                        if (__this.name == this.name) {
                            checked = true;
                            return true;
                        }
                    });
                    $('<option>').text(this.name).val(this.name)
                        .prop('selected', checked).appendTo(GROUPS_SELECTOR);

                });
                MULTI_ATTEMPTS_CHECKBOX.prop('checked', this.multi_attempts);
                INTERACTIVE_CORRECTION_CHECKBOX.prop('checked', this.interactive_correction);
            };

            /*
             * Add a new exercise
             */
            this.new_exercise = function () {
                console.log('new exercise');
                var this_handler = this;
                var modal_body = CHOSE_EXERCISE_MODAL.find('.modal-body').empty();

                $.each(exercise_types, function () {
                    var this_handler_inner = this;
                    $('<a>')
                        .text(this_handler_inner.fr)
                        .addClass('btn btn-default')
                        .css('width', '100%')
                        .css('margin-bottom', '10px')
                        .click(function () {
                            CHOSE_EXERCISE_MODAL.modal('hide');
                            this_handler.new_exercise_handler(this_handler_inner);
                        }).appendTo(modal_body);
                });

                CHOSE_EXERCISE_MODAL.modal('show');
            };

            this.new_exercise_handler = function (type) {
                console.log('new exercise handler');
                var new_ex = new Exercise(this.exercises.length, 'Nouvel exercice', type);
                new_ex.init();
                this.exercises.push(new_ex);
                console.log('Exercises: ' + this.exercises);
                console.log('done.');
            };

            this.synchronize_exercises_array = function () {
                var exs = this.exercises;
                for (var i = 0; i < exs.length; i++) {
                    exs[i].index = i;
                }
            };

            this.synchronize_exercises_array_position = function () {
                this.exercises.sort(function compare(a, b) {
                    if (a.index < b.index)
                        return -1;
                    if (a.index > b.index)
                        return 1;
                    return 0;
                });
            };

            this.set_exercise_index_to_position = function () {
                var exs = this.exercises;
                EXERCISE_LIST.children('*').each(function (child_index, e) {
                    for (var i = 0; i < exs.length; i++) {
                        if (exs[i].exercice_wrapper.attr('id') == $(e).attr('id')) {
                            exs[i].index = child_index;
                            break;
                        }
                    }
                });
            };

            this.sort_exercise_array = function () {
                activity.set_exercise_index_to_position();
                activity.synchronize_exercises_array_position();
                for (var i = 0; i < activity.exercises.length; i++) {
                    console.log(activity.exercises[i].index)
                }
            };

            this.delete_exercise = function (index) {
                var result = false;
                if (index != undefined) {
                    var exs = this.exercises;
                    for (var i = 0; i < exs.length; i++) {
                        if (exs[i].index === index) {
                            exs.splice(i, 1);
                            this.synchronize_exercises_array();
                            return true;
                        }
                    }

                    console.log('Exercise ' + index + ' do not exist on array: ' + exs);
                }
                else {
                    console.log('Cannot remove undefined exercise index');

                }

                return false;
            };
        };

        /*
         * Group constructor
         *
         * args name: String
         */
        var Group = function (name, id) {
            this.id = id;
            this.name = name;
        };


        var Exercise = function (index, title, type, exercise_json, correction_elements) {

            console.log('-- new exercise');
            console.log(index);
            console.log(title);
            console.log(type);
            console.log(exercise_json);
            console.log(correction_elements);
            console.log('--');
            this.index = index; // 0-*
            this.title = title;
            this.type = type;
            this.exercise_json = exercise_json;
            this.correction_elements = correction_elements;

            //fields
            this.exercice_wrapper = undefined;
            this.title_header = undefined;
            this.title_type_header = undefined;
            this.delete_button = undefined;
            this.exercise_container = undefined;
            this.title_field = undefined;

            this.exercise_specific_buttons_span = undefined;

            this.exercise_wysiwyg = undefined;

            /*
             * methodes
             */

            this.init = function () {
                var no_ex_text = EXERCISE_LIST.children('p.no-exercise');
                if (no_ex_text.length) {
                    no_ex_text.remove();
                }

                this.display_fields();
                EXERCISE_LIST.accordion("refresh");
                this.display_wysiwyg();
                this.bind_buttons();
                this.display_and_bind_specific_buttons();

                // prevent accordion glitch
                EXERCISE_LIST.prevent_accordion_glitch_before();
                EXERCISE_LIST.prevent_accordion_glitch_after();
            };

            this.display_and_bind_specific_buttons = function () {
                var btns_span = $('<div>').addClass('specific-buttons-container btn-group').insertAfter(this.exercise_container.find('.note-toolbar').find('.note-history'));

                var create_button = function (fa_name, tooltip_text, func_to_return_html, this_handler) {
                    var $btn = $('<button>').attr('type', 'button').addClass('btn btn-info btn-sm btn-small')
                        .attr('tabindex', '-1').append($('<i>').addClass('fa').addClass(fa_name)).appendTo(btns_span);
                    create_tooltip($btn, tooltip_text);
                    bind_focusout($btn, this_handler);
                    bind_to_editor($btn, func_to_return_html, this_handler);
                    return $btn;
                };

                var create_tooltip = function ($btn, text) {
                    $btn.attr('data-original-title', text).tooltip({
                        container: 'body',
                        trigger: 'hover',
                        placement: 'bottom'
                    }).on('click', function () {
                        $(this).tooltip('hide');
                    });
                };

                var bind_focusout = function ($btn, this_handler) {
                    this_handler.exercise_container.find('.note-editable').bind('focusout', function (e) {
                        if ($btn.is(":active")) {
                            e.preventDefault();
                            $(this).focus();
                        }
                    });
                };

                var bind_to_editor = function ($btn, func_to_return_html, this_handler) {
                    var note_editable = this_handler.exercise_container.find('.note-editable');
                    $btn.on('click', function () {
                        if (!note_editable.is(':focus')) {
                            this_handler.exercise_wysiwyg.summernote('focus');
                        }

                        pasteHtmlAtCaret(func_to_return_html())
                    });
                };

                var pasteHtmlAtCaret = function (html) {
                    if (html != undefined && html != '') {
                        var sel, range;
                        if (window.getSelection) {
                            // IE9 and non-IE
                            sel = window.getSelection();
                            if (sel.getRangeAt && sel.rangeCount) {
                                range = sel.getRangeAt(0);
                                if (!range.collapsed) {
                                    range.deleteContents();

                                    // Range.createContextualFragment() would be useful here but is
                                    // non-standard and not supported in all browsers (IE9, for one)
                                    var el = document.createElement("div");
                                    el.innerHTML = html;
                                    var frag = document.createDocumentFragment(), node, lastNode;
                                    while ((node = el.firstChild)) {
                                        lastNode = frag.appendChild(node);
                                    }
                                    range.insertNode(frag);

                                    // Preserve the selection
                                    if (lastNode) {
                                        range = range.cloneRange();
                                        range.setStartAfter(lastNode);
                                        range.collapse(true);
                                        sel.removeAllRanges();
                                        sel.addRange(range);
                                    }
                                }
                            }
                        } else if (document.selection && document.selection.type != "Control") {
                            // IE < 9
                            document.selection.createRange().pasteHTML(html);
                        }
                    }
                };

                var this_handler = this;

                $.each(this.type.buttons, function(){
                    create_button(
                        this.fa_icon,
                        this.tooltip_text,
                        this.html,
                        this_handler
                    );
                });
            };

            this.display_fields = function () {
                this.exercice_wrapper = $('<div>').addClass('list-group-item group').attr('id', Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16).substring(1)).appendTo(EXERCISE_LIST);
                var group_header = $('<div>').addClass('group-header').appendTo(this.exercice_wrapper);// append group header
                this.title_header = $('<span>').addClass('exercise-title').text(' ' + this.title).appendTo(group_header);
                this.title_type_header = $('<span>').addClass('exercise-type').text((this.type != undefined && this.type != '') ? (' (' + this.type.fr + ')') : '').appendTo(group_header);

                // add delete button
                this.delete_button = $('<a>').addClass('btn btn-danger btn-xs btn-delete')
                    .append($('<span>').addClass('glyphicon glyphicon-remove')).append(' Supprimer').appendTo($('<div>').addClass('exercise-delete pull-right').appendTo(group_header));


                this.exercise_container = $('<div>').addClass('edit-activity-exercises-container').appendTo(this.exercice_wrapper);
                this.title_field = $('<input>').addClass('form-control exercise-title-input')
                    .attr('placeholder', 'Titre de l\'exercice').attr('type', 'text').val(this.title).appendTo($('<div>')
                        .addClass('input-group margin-bottom-20').append($('<span>').addClass('input-group-addon').text('Titre')).appendTo(this.exercise_container));

                this.exercise_wysiwyg = $('<div>').addClass('exercise-wysiwyg').append($.parseHTML(this.exercise_json)).appendTo(this.exercise_container);

                // sync fields and inputs
                var this_handler = this;
                this.title_field.bind('keypress keyup blur', function () {
                    this_handler.title_header.text(' ' + $(this).val());
                });
            };

            this.display_wysiwyg = function () {
                var this_handler = this;
                var sendFile = function (file, editor) {
                    var data = new FormData();
                    data.append("file", file);
                    $.ajax({
                        data: data,
                        type: "POST",
                        url: UPLOAD_FILE_URL,
                        cache: false,
                        contentType: false,
                        processData: false,
                        success: function (url) {
                            console.log(url);
                            editor.summernote('insertNode', $('<img>').attr('src', url)[0]);
                        }
                    });
                };
                this.exercise_wysiwyg.summernote({
                    lang: 'fr-FR',
                    height: null,                 // set editor height
                    minHeight: null,             // set minimum height of editor
                    maxHeight: null,             // set maximum height of editor
                    toolbar: [
                        //[groupname, [button list]]

                        ['style', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
                        ['fontname', ['fontname']],
                        ['fontsize', ['fontsize']],
                        ['color', ['color']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['height', ['height']],
                        ['table', ['table']],
                        ['insert', ['link', 'picture', 'video', 'hr']],
                        ['history', ['undo', 'redo']],
                        ['misc', ['fullscreen', 'help']]
                    ],
                    onChange: function (contents, $editable) {
                        EXERCISE_LIST.prevent_accordion_glitch();
                    },
                    onImageUpload: function (files) {
                        var file = files[0];
                        console.log('image upload:', file);
                        sendFile(file, this_handler.exercise_wysiwyg);
                    }
                });
            };

            this.bind_buttons = function () {
                var this_handler = this;
                this.delete_button.delete_modal(function (event) {
                        this_handler.delete();
                    },
                    'Etes-vous sûr de vouloir supprimer cet exercice ?'
                );
            };

            this.delete = function () {
                console.log('Exercise: ' + this.index + ' will be deleted');
                if (activity.delete_exercise(this.index)) {
                    this.exercice_wrapper.remove();
                    EXERCISE_LIST.prevent_accordion_glitch();
                }
            };

            this.update_from_fields = function () {
                this.title = this.title_field.val();
                //this.type = type;// exercise types: cloze_test(texte à trous),

                var nodes_to_exercise_json = this.exercise_container.find('.note-editable').clone();
                nodes_to_exercise_json.find('.correction-element').replaceWith($('<span>').addClass('correction-element-emplacement'));
                this.exercise_json = nodes_to_exercise_json.html();

                this.correction_elements = [];
                var this_handler = this;
                this.exercise_container.find('.note-editable').find('.correction-element').each(function (id, element) {
                    this_handler.correction_elements.push($(element).text());
                });

            };
        };

        var exercise_types = {
            INCOMPLETE_EXERCISE: {
                fr: 'Exercice lacunaire',
                bd_name: 'incomplete_exercise',
                buttons: [
                    {
                        fa_icon: 'fa-square',
                        tooltip_text: 'Ajouter un trous',
                        html: function () {
                            return '<span class="correction-element exercise-gap">' + window.getSelection() + '</span>';
                        }
                    }
                ]
            }

        };

        // OTHER
        var display = function () {
            if (ACTIVITY_INDICATOR.attr('data-activity')) {
                activity = new Activity(ACTIVITY_INDICATOR.data('activity'));
                activity.init();
            }
            else {
                activity = new Activity();
                activity.init();
            }
        }();


        return this;
    };
})
(jQuery);