'use strict';

angular
    .module('angularApp')
    .factory('Batch', function (Restangular) {
        return {
            execute: function(obj) {
                var queryString =  jQuery.param(obj);
                return Restangular.one('batch?'+queryString).get();
            }
        };
    });