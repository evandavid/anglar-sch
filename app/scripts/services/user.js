'use strict';

angular
    .module('angularApp')
    .factory('User', function (Restangular) {
        return {
            me: function() {
                return Restangular.one('users/me').get();
            },
            create: function(user) {
                return Restangular.all('users/create').customPOST({user: user}, null, {}, {});
            },
            update: function(user) {
                return Restangular.all('users/update').customPOST({user: user}, null, {}, {});
            },
            delete: function(id) {
                return Restangular.all('users').customDELETE('delete?userId='+id, {});
            },
            undelete: function(id) {
                return Restangular.all('users/undelete').customPOST({userId: id}, null, {}, {});
            },
            getAll: function(name, username, page, maid) {
                return Restangular.one('users/all?filterName='+name+'&filterUsername='+username+'&page='+page+'&maid='+maid).get();
            },
        };
    });