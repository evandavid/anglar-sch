'use strict';

angular
    .module('angularApp')
    .factory('User', function (Restangular) {
        return {
            me: function() {
                return Restangular.one('20sd7').get();
            },
        };
    });