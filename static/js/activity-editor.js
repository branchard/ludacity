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
            EXERCISE_LIST.prevent_accordion_glitch = function () {
                $(this).css({"min-height": $(this).innerHeight()});
            };

            EXERCISE_LIST.prevent_accordion_glitch_before = function () {
                $(this).css({"min-height": 0});
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
                    activate: this.prevent_accordion_glitch
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
                    }
                });
                this.prevent_accordion_glitch();
            };
        }

        var NEW_EXERCISE_BUTTON = $('#new-exercise-button');


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
                this.pull();

                // bind bottons
                // TODO il faut penser à faite un indicateur de sauvegarde en cours ou terminée
                SAVE_BUTTON.click(function () {
                    var $btn = $(this);
                    $btn.button('loading');
                    activity.push();
                    $btn.button('reset');
                });

                EXERCISE_LIST.init();

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
                        dataType: "json",
                        success: function () {
                            toastr.success('Activité sauvegardée !')
                        },
                        error: function () {
                            toastr.error('L\'activité n\'a pu être sauvegardée')
                        }
                    });

                    // get id
                    var _this = this;
                    $.getJSON(ACTIVITY_AJAX_GET_URL + '?latest', function (data) {
                        _this.id = data['id'];
                    });
                    history.replaceState({}, "", this.id);
                    this.pull();
                }
                else {
                    console.log('Post activity: ' + this.id + ': ' + this.title);
                    $.ajax({
                        url: ACTIVITY_AJAX_POST_URL,
                        type: 'POST',
                        data: JSON.stringify({
                            'id': this.id,
                            'title': this.title,
                            'groups': this.checked_groups,
                            'multi_attempts': this.multi_attempts,
                            'interactive_correction': this.interactive_correction
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
                        _this.exercises = data['exercises'];
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
                var new_ex = new Exercise(this.exercises.length, 'Nouvel exercice', '');
                new_ex.init();
                this.exercises.push(new_ex);
                console.log('done.');
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

        /**
         @constructor
         @abstract
         */
        var Exercise = function (index, title, type) {
            /*
             if (this.constructor === Exercise) {
             throw new Error("Can't instantiate abstract class!");
             }
             */
            this.index = index; // 0-*
            this.title = title;
            this.type = type;// exercise types: cloze_test(texte à trous),
            this.exercise_json = undefined;

            //fields
            this.exercice_wrapper = undefined;
            this.title_header = undefined;
            this.title_type_header = undefined;
            this.delete_button = undefined;
            this.exercise_container = undefined;
            this.title_field = undefined;
            this.exercise_wysiwyg = undefined;

            /*
             * methodes
             */

            this.init = function () {
                var no_ex_text = EXERCISE_LIST.children('p.no-exercise');
                if(no_ex_text.length){
                    no_ex_text.remove();
                }

                this.display_fields();
                EXERCISE_LIST.accordion("refresh");
                this.display_wysiwyg();
                this.bind_buttons();
                // prevent accordion glitch
                EXERCISE_LIST.prevent_accordion_glitch_before();
                EXERCISE_LIST.prevent_accordion_glitch();

            };

            this.display_fields = function () {
                this.exercice_wrapper = $('<div>').addClass('list-group-item group').appendTo(EXERCISE_LIST);
                var group_header = $('<div>').addClass('group-header').appendTo(this.exercice_wrapper);// append group header
                this.title_header = $('<span>').addClass('exercise-title').text(' ' + this.title).appendTo(group_header);
                this.title_type_header = $('<span>').addClass('exercise-type').text((this.type != undefined && this.type != '') ? (' (' + this.type + ')') : '').appendTo(group_header);

                // add delete button
                this.delete_button = $('<a>').addClass('btn btn-danger btn-xs btn-delete')
                    .append($('<span>').addClass('glyphicon glyphicon-remove')).append(' Supprimer').appendTo($('<div>').addClass('exercise-delete pull-right').appendTo(group_header));


                this.exercise_container = $('<div>').addClass('edit-activity-exercises-container').appendTo(this.exercice_wrapper);
                this.title_field = $('<input>').addClass('form-control exercise-title-input')
                    .attr('placeholder', 'Titre de l\'exercice').attr('type', 'text').appendTo($('<div>')
                        .addClass('input-group margin-bottom-20').append($('<span>').addClass('input-group-addon').text('Titre')).appendTo(this.exercise_container));

                this.exercise_wysiwyg = $('<div>').addClass('exercise-wysiwyg').appendTo(this.exercise_container);

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
                        //prevent_accordion_glitch_before();
                        //prevent_accordion_glitch();
                        EXERCISE_LIST.prevent_accordion_glitch_before();
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
                this.delete_button.click(function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    console.log("delete button clicked!");
                });
            };
        };

        var ExerciseTypeEnum = {
            CLOZE_TEST: 'cloze_test'// texte à trous
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