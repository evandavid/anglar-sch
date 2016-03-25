'use strict';

angular
    .module('angularApp')
    .factory('Authentication', function (Restangular) {
        return {
            authenticate: function(user) {
                return Restangular.all('authenticate').customPOST(user, null, {}, {});
            }
        };
    });