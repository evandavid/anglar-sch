'use strict';

angular.module('angularApp')
  .controller('UsersCtrl', function (User, Role, $timeout, $state) {
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
        vm.uuid = _generateUUID();
        if ($state.current.name == 'app.restricted.maid'){
            vm.selectedUser.username = _generateUUID();
            vm.selectedUser.password = _generateUUID();
            vm.selectedUser.roleId = 3;
        } else {
            vm.selectedUser.passport = _generateUUID();
            vm.selectedUser.phoneNumber = _generateUUID();
            vm.selectedUser.phoneNumberIdn = _generateUUID();
            vm.selectedUser.address = _generateUUID();
        }
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

        User.getAll(vm.filter.name, vm.filter.username, vm.currentPage, $state.current.name == 'app.restricted.maid')
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

    function _toDisplayDate(_date){
        var date = new Date(_date);
        return date.getDate()+ '-' + (date.getMonth()+1) + '-' +  date.getFullYear();
    }

    function _editUser(user) {
        _resetForm();
        $timeout(function(){
            vm.selectedUser = angular.copy(user);
            if (user.Roles && user.Roles[0]) {
                vm.selectedUser.roleId = user.Roles[0].id;
            }
            vm.selectedUser.dateOfBirth =  _toDisplayDate(vm.selectedUser.dateOfBirth);
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

    function _generateUUID() {
        function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
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
