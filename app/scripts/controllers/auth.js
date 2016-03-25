'use strict';

angular.module('angularApp')
  .controller('AuthCtrl', function ($rootScope, Authentication, localStorageService, $state) {
    var vm = this;

    function _toggleLogginIn() {
        vm.logginIn = !vm.logginIn;
    }

    function _checkToken() {
        if (localStorageService.get('token')){
            //logged in, go to dashboard
            $state.go('app.restricted.dashboard');
        }
    }

    function _doLogin(){
        _toggleLogginIn();
        vm.errorLogin= null;

        Authentication.authenticate(vm.user)
            .then(function(res){
                $rootScope.token = res.token;
                localStorageService.set('token', res.token);

                // logged in, go to dashboard.
                console.clear();
                $state.go('app.restricted.dashboard');
                _toggleLogginIn();
            }, function(err){
                vm.errorLogin = err.data.message;
                _toggleLogginIn();
            });
    }

    _checkToken();

    // controller assignment.
    vm.doLogin = _doLogin;
  });
