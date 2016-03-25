'use strict';

angular.module('angularApp')
  .controller('UsersCtrl', function (User, Role, $timeout) {
    var vm = this;
    vm.selectedUser = {};
    vm.selectedUser.isActive = true;
    vm.currentPage = 1;

    function _clearFilter() {
        vm.filter = {};
        vm.filter.name = '';
        vm.filter.username = '';
    }

    _clearFilter();

    function _resetForm() {
        vm.showForm = true;
        vm.formError = null;
        vm.formSuccess = null;
    }

    function _getForm() {
        _resetForm();
    }

    function _closeForm() {
        vm.showForm = false;
        vm.selectedUser = {};
        vm.processing = false;
    }

    function _refreshList(dontHideUndo) {
        var _dontHideUndo = dontHideUndo || false;
        vm.loadData = true;
        if (!_dontHideUndo) { vm.deleteId = null; }

        User.getAll(vm.filter.name, vm.filter.username, vm.currentPage)
            .then(function(res){
                vm.loadData = false;
                vm.users = res.users;
                vm.totalPage = res.total;
            });
    }

    function _createOrUpdateUser(user) {
        vm.formError = null;
        vm.processing = true;

        function _submitSuccess() {
            vm.formSuccess = true;
            $timeout(function(){
                _closeForm();
                _refreshList();
            }, 600);
        }

        if (user.id) {
            User.update(user)
                .then(function(){
                    _submitSuccess();
                }, function(err){
                    vm.formError = err.data.message;
                    vm.processing = false;
                });
        } else {
            User.create(user)
                .then(function(){
                    _submitSuccess();
                }, function(err){
                    vm.formError = err.data.message;
                    vm.processing = false;
                });
        }
    }

    function _getRole() {
        Role.getAll()
            .then(function(res){
                vm.roles = res.roles;
            });
    }

    function _editUser(user) {
        _resetForm();
        $timeout(function(){
            vm.selectedUser = angular.copy(user);
            if (user.Roles && user.Roles[0]) {
                vm.selectedUser.roleId = user.Roles[0].id;
            }
            delete vm.selectedUser.Roles;
        });
    }

    function _deleteUser(id) {
        vm.deleteId = id;
        User.delete(id)
            .then(function(res){
                if (res.success){
                    _refreshList(true);
                }
            });
    }

    function _undoDelete() {
        User.undelete(vm.deleteId)
            .then(function(res){
                if (res.success){
                    _refreshList();
                }
            });
    }

    _getRole();
    _refreshList();

    // controller assignment
    vm.undoDelete = _undoDelete;
    vm.editUser   = _editUser;
    vm.getForm    = _getForm;
    vm.closeForm  = _closeForm;
    vm.refresh    = _refreshList;
    vm.submitForm = _createOrUpdateUser;
    vm.clrFilter  = _clearFilter;
    vm.deleteUser = _deleteUser;
  });
