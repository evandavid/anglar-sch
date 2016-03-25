'use strict';
/*jshint -W080 */

angular.module('angularApp')
    .factory('Cancan', function ($q, $http, User) {
        var _identity  = undefined,
        _authenticated = false;

        return {
            isIdentityResolved: function() {
                return angular.isDefined(_identity);
            },
            isAuthenticated: function() {
                return _authenticated;
            },
            isInRole: function(roles) {
                if (!_authenticated || !_identity.roles) {
                    return false;
                }

                return _identity.roles.indexOf(roles) !== -1;
            },
            isInAnyRole: function(roles) {
                if (!_identity){
                    return false;
                }
                if (!_authenticated || !_identity.roles) {
                    return false;
                }
                for (var i = 0; i < roles.length; i++) {
                    if (this.isInRole(roles[i])) {
                        return true;
                    }
                }

                return false;
            },
            authenticate: function(identity) {
                _identity = identity;
                _authenticated = identity !== null;
            },
            identity: function(force) {
                var deferred = $q.defer();

                if (force === true) {
                    _identity = undefined;
                }

                // check and see if we have retrieved the identity data from the server. if we have, reuse it by immediately resolving
                if (angular.isDefined(_identity)) {
                    deferred.resolve(_identity);
                    return deferred.promise;
                }

                User.me()
                    .then(function(response){
                        _identity       = response.user;
                        _authenticated  = true;
                        deferred.resolve(_identity);
                    }, function(){
                        _identity = null;
                        _authenticated = false;
                        deferred.resolve(_identity);
                    });

                return deferred.promise;
            }
        };
  });