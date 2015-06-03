// jQuery plugin
(function ($) {

    'use strict';

    $.fn.activity_manager = function () {
        // Configuration
        var ACTIVITY_AJAX_PUT_URL = "/api/activity/add";
        var ACTIVITY_AJAX_POST_URL = "/api/activity/change";

        // DOM jQuery elements
        var SAVE_BUTTON = $('#save-button');
        var PREVIEW_BUTTON = $('#preview-button');
        var ACTIVITY_HEADER = $('#activity-header');
        {
            var TITLE_FIELD = ACTIVITY_HEADER.find('input[name="title"]');
            var GROUPS_FIELD = ACTIVITY_HEADER.find('input[name="groups"]');
            var MULTI_ATTEMPTS_CHECKBOX = ACTIVITY_HEADER.find('input[name="mult"]');
            var INTERACTIVE_CORRECTION_CHECKBOX = ACTIVITY_HEADER.find('input[name="interactive"]')
        }


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
        Activity = function (id, title, groups, multi_attempts, interactive_correction) {
            this.id = id;
            this.title = title;
            this.groups = groups;
            this.multi_attempts = multi_attempts;
            this.interactive_correction = interactive_correction;


            // methods

            /*
             * PUT or POST activity
             */
            this.push = function () {
                // Checks if this is a new activity
                if (id == undefined) {
                    console.log('Put activity: ' + this.title);
                    $.ajax({
                        url: ACTIVITY_AJAX_PUT_URL,
                        type: 'PUT',
                        data: JSON.stringify({
                            'title': this.title,
                            'groups': this.groups,
                            'multi_attempts': this.multi_attempts,
                            'interactive_correction': this.interactive_correction
                        }),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        complete: function () {
                            console.log('Put complete');
                        }
                    });
                }
                else {
                    console.log('Post activity: ' + this.id + ': ' + this.title);
                    $.ajax({
                        url: ACTIVITY_AJAX_POST_URL,
                        type: 'POST',
                        data: JSON.stringify({
                            'id': this.id,
                            'title': this.title,
                            'groups': this.groups,
                            'multi_attempts': this.multi_attempts,
                            'interactive_correction': this.interactive_correction
                        }),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        complete: function () {
                            console.log('Put complete');
                        }
                    });
                }
            };

            /*
             * Update from server
             */
            this.pull = function() {
                // TODO AJAX Json
            };

            /*
             * Update from fields
             */
            this.update_from_fields = function () {
                this.title = TITLE_FIELD.val();
                this.groups = [];
                var next_var = this;
                $.each(GROUPS_FIELD.find('option:selected'), function () {
                    if ($(this).val() != 'Aucune') {
                        next_var.groups.push($(this).val());
                    }
                });
                this.multi_attempts = MULTI_ATTEMPTS_CHECKBOX.is(':checked');
                this.interactive_correction = INTERACTIVE_CORRECTION_CHECKBOX.is(':checked');
            };

            /*
             * Update fields
             */
            this.update_fields = function () {
                TITLE_FIELD.text(this.title);
                // TODO groups
                MULTI_ATTEMPTS_CHECKBOX.prop('checked', this.multi_attempts);
                INTERACTIVE_CORRECTION_CHECKBOX.prop('checked', this.interactive_correction);
            };

        };

        /*
         * Group constructor
         *
         * args name: String
         */
        Group = function (name) {
            this.name = name;
        };


        return this;
    };
})(jQuery);