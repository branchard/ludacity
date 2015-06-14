(function ($) {

    'use strict';

    var exercise_types = {};

    var add_exercise_type = function (plugin) {
        if (exercise_types == undefined) {
            exercise_types = {};
        }
        $.extend(exercise_types, plugin);
        console.log('--------');
        console.log(exercise_types);
    };

    $.exercises_manager = function (command, arg) {


        switch (command) {
            case 'add-exercise':
                add_exercise_type(arg);
                break;
            case 'exercise-types':
                return exercise_types;
            break;
        }


    };
})
(jQuery);