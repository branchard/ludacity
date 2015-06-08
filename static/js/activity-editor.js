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
                    activity.push();
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
                this.exercises.push(new Exercise());
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
            this.title_field = undefined;

            this.display_fields = function () {
                var fields_wrapper = EXERCISE_LIST.children().eq(this.index);

                this.title_field = fields_wrapper.find('.exercise-title').text('{0} ({1})'.format(this.title, this.type));//display title

                this.fields_container = fields_wrapper.find('.edit-activity-exercises-container');


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