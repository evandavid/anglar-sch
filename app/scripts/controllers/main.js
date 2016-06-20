'use strict';

angular.module('angularApp')
    .controller('MainCtrl', function($rootScope, currentUser, localStorageService, $state, Job){
        $rootScope.currentUser = currentUser;

        $rootScope.logout = function(){
            localStorageService.set(currentUser.username, null);
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

        // function _checkTodaysJob() {
        //     //if (currentUser.roles[0] === 'user'){
        //         Job.getAll('', '', '', 0, new Date())
        //             .then(function(res){
        //                 $rootScope.todaysJob = res.jobs;
        //                 if (res.jobs.length) {
        //                     jQuery('#modalJob').modal('show');
        //                 }
        //             });
        //     //}
        // }

        // _checkTodaysJob();
});
