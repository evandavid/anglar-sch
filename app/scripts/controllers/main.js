'use strict';

angular.module('angularApp')
    .controller('MainCtrl', function($rootScope, currentUser, localStorageService, $state){
        $rootScope.currentUser = currentUser;

        $rootScope.logout = function(){
            localStorageService.set('token', null);
            $state.go('auth');
        };

        $rootScope.pageCount = function(totalPage) {
            return Math.ceil(totalPage / 10);
        };

        $rootScope.range = function(min, max, step) {
            step = step || 1;
            var input = [];
            for (var i = min; i <= max; i += step) {
                input.push(i);
            }
            return input;
        };
});
