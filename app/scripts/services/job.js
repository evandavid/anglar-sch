'use strict';

angular
    .module('angularApp')
    .factory('Job', function (Restangular) {
        return {
            me: function() {
                return Restangular.one('jobs/me').get();
            },
            create: function(job) {
                return Restangular.all('jobs/create').customPOST({job: job}, null, {}, {});
            },
            update: function(job) {
                return Restangular.all('jobs/update').customPOST({job: job}, null, {}, {});
            },
            delete: function(id) {
                return Restangular.all('jobs').customDELETE('delete?id='+id, {});
            },
            undelete: function(id) {
                return Restangular.all('jobs/undelete').customPOST({id: id}, null, {}, {});
            },
            getAll: function(name, page,maidName, userId, startAt, endAt) {
                var _startAt = startAt || 0;
                var _endAt = endAt || 0;
                return Restangular
                    .one('jobs/all?filterName='+name+'&page='+page+'&maidName='+maidName+'&userId='+userId+'&startAt='+_startAt+'&endAt='+_endAt)
                    .get();
            },
        };
    });