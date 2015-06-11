(function ($) {
    $.cloze_test =
    {
        name: 'cloze test',

        init: function (layoutInfo) {
            var $note = layoutInfo.holder();


        },

        buttons: {
            // gap: trous
            cloze_test_add_gap: function () {
                return tmpl.iconButton('fa fa-square', {
                    event: 'cloze_test_add_gap',
                    title: 'cloze_test_add_gap',
                    hide: true
                });
            }
        },

        events: {}
    };
}(jQuery));
