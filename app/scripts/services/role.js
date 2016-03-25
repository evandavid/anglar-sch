'use strict';

angular
    .module('angularApp')
    .factory('Role', function (Restangular) {
        return {
            getAll: function() {
                return Restangular.one('roles/all').get();
            }
        };
    });