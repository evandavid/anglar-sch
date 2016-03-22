'use strict';

angular.module('angularApp')
  .controller('AuthCtrl', function () {
    var vm = this;

    function _doLogin(){
        vm.logginIn = true;

    }

    // controller assignment.
    vm.doLogin = _doLogin;

  });
