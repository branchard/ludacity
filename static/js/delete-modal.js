(function ($) {
    'use strict';

    // a faire sur un bouton de suppression
    $.fn.delete_modal = function (function_to_do_on_click, confirmation_text) {
        var modal = $('#confirm-delete-modal');
        this.click(function () {
            event.stopPropagation();
            event.preventDefault();
            modal.find('.modal-body').empty().add('<p>').text(confirmation_text);
            modal.find('#yes-btn').unbind().click(function_to_do_on_click).click(function () {
                modal.modal('hide');
                console.log('deleted');
            });

            modal.modal('show');
        });
        return this;
    };
}(jQuery));
