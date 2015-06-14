(function ($) {

    'use strict';

    // template
    var tmpl = $.summernote.renderer.getTemplate();

    // core functions: range, dom
    var range = $.summernote.core.range;
    var dom = $.summernote.core.dom;

    /**
     * @param {jQuery} $editable
     * @return {String}
     */
    var getTextOnRange = function ($editable) {
        $editable.focus();

        var rng = range.create();

        // if range on anchor, expand range with anchor
        if (rng.isOnAnchor()) {
            var anchor = dom.ancestor(rng.sc, dom.isAnchor);
            rng = range.createFromNode(anchor);
        }

        return rng.toString();
    };

    $.exercises_manager('add-exercise', {
        INCOMPLETE_EXERCISE: {
            fr: 'Exercice lacunaire',
            bd_name: 'incomplete_exercise',

            summernote_plugin: {
                /** @property {String} name name of plugin */
                name: 'incomplete_exercise',

                /**
                 * @property {Object} buttons
                 * @property {Function} buttons.incomplete_exercise  function to make button
                 */
                buttons: { // buttons
                    incomplete_exercise: function () {
                        return tmpl.iconButton('fa fa-square', {
                            event: 'incomplete_exercise',
                            title: 'Ajouter un trous',
                            btnStyle: 'btn-info',
                            hide: true
                        });
                    }
                },

                /**
                 * @property {Object} events
                 */
                events: { // events
                    incomplete_exercise: function (event, editor, layoutInfo) {
                        // Get current editable node
                        var $editable = layoutInfo.editable();
                        var selectedText = getTextOnRange($editable);
                        if (selectedText.length > 0) {
                            var node = $('<span class="correction-element exercise-gap">' + selectedText + '</span>');
                            editor.insertNode($editable, node[0]);
                        }
                    }
                }

            }
        }
    });
})
(jQuery);

