'use strict';

angular
    .module('angularApp')
    .directive('checkMenuAuthorized', function ($state, Cancan) {
        return {
            restrict: 'A',
            link: function(scope, el) {
                var jEl = jQuery(el);
                var stateName = jEl.attr('ui-sref');
                var state = $state.get(stateName);
                if (
                    state.data !== undefined &&
                    state.data.roles &&
                    state.data.roles.length > 0 &&
                    !Cancan.isInAnyRole(state.data.roles)
                ){
                    jEl.hide();
                } else {
                    jEl.show();
                }
            }
        };
    });