'use strict';

angular
    .module('angularApp')
    .factory('Service', function (Restangular) {
        return {
            me: function() {
                return Restangular.one('services/me').get();
            },
            create: function(service) {
                return Restangular.all('services/create').customPOST({service: service}, null, {}, {});
            },
            update: function(service) {
                return Restangular.all('services/update').customPOST({service: service}, null, {}, {});
            },
            delete: function(id) {
                return Restangular.all('services').customDELETE('delete?id='+id, {});
            },
            undelete: function(id) {
                return Restangular.all('services/undelete').customPOST({id: id}, null, {}, {});
            },
            getAll: function(name, page) {
                return Restangular.one('services/all?filterName='+name+'&page='+page).get();
            },
        };
    });