'use strict';

angular
    .module('angularApp')
    .factory('Authorization', function ($rootScope, $state, Cancan) {
        return {
            authorize: function() {
                return Cancan.identity()
                    .then(function() {
                        var isAuthenticated = Cancan.isAuthenticated();
                        if (
                            $rootScope.toState.data !== undefined &&
                            $rootScope.toState.data.roles &&
                            $rootScope.toState.data.roles.length > 0 &&
                            !Cancan.isInAnyRole($rootScope.toState.data.roles))
                        {

                        if (isAuthenticated) {
                            $state.go('app.restricted.dashboard'); // user is signed in but not authorized for desired state
                        } else {
                            // user is not authenticated. stow the state they wanted before you
                            // send them to the signin state, so you can return them when you're done
                            $rootScope.returnToState       = $rootScope.toState;
                            $rootScope.returnToStateParams = $rootScope.toStateParams;

                            // now, send them to the signin state so they can log in
                            $state.go('auth');
                        }
                    }
                });
            }
        };
    });