'use strict';

angular.module('angularApp')
  .controller('JobsCtrl', function (Job, $timeout, Batch, $rootScope) {
    var vm = this;
    vm.selectedData = {};
    vm.currentPage = 1;

    function _parseDate(data){
        if (data !== undefined && data !== null && data !== ''){
            var _date = data.split(' ')[0].split('-');
            var _time = data.split(' ')[1].split(':');

            return {
                year: parseInt(_date[2]),
                month: parseInt(_date[1])-1,
                day: parseInt(_date[0]),
                hour: parseInt(_time[0]),
                minute: parseInt(_time[1])
            };
        } else {
            return null;
        }
    }

    function _toJsDate(parsedDate) {
        return new Date(parsedDate.year, parsedDate.month, parsedDate.day, parsedDate.hour, parsedDate.minute);
    }

    function _toDisplayDate(_date){
        var date = new Date(_date);
        return date.getDate()+ '-' + (date.getMonth()+1) + '-' +  date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
    }

    function _initialData() {
        Batch.execute({
            users: '/api/users/all',
            services: '/api/services/all'
        }).then(function(res){
            vm.users = [];
            if (res.users && res.users.users && res.users.users.length){
                for (var i =0; i < res.users.users.length; i++){
                    var item = res.users.users[i];
                    if (item.Roles[0].name !== 'superadmin'){
                        vm.users.push(item);
                    }
                }
            }
            vm.services = res.services.services;
        });
    }

    _initialData();

    function _clearFilter() {
        vm.filter = {};
        vm.filter.name = '';
        vm.filter.username = '';
        vm.filter.maidName = '';
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
        vm.selectedData = {};
        vm.processing = false;
    }

    function _refreshList(dontHideUndo) {
        var _dontHideUndo = dontHideUndo || false;
        vm.loadData = true;
        if (!_dontHideUndo) { vm.deleteId = null; }

        var userId = 0;
        if ($rootScope.currentUser.roles[0] === 'user'){
            userId = $rootScope.currentUser.id;
        }

        Job.getAll(vm.filter.name, vm.currentPage, vm.filter.maidName, userId)
            .then(function(res){
                vm.loadData = false;
                vm.jobs = res.jobs;
                vm.totalPage = res.total;
            });
    }

    function _createOrUpdate(_service) {
        var service = angular.copy(_service);
        vm.formError = null;
        vm.processing = true;

        var parsedStartTime = _parseDate(service.startTime);
        if (parsedStartTime) { service.startTime = _toJsDate(parsedStartTime); }
        var parsedEndTime = _parseDate(service.endTime);
        if (parsedEndTime) { service.endTime = _toJsDate(parsedEndTime); }

        function _submitSuccess() {
            vm.formSuccess = true;
            $timeout(function(){
                _closeForm();
                _refreshList();
            }, 600);
        }

        if (service.id) {
            Job.update(service)
                .then(function(){
                    _submitSuccess();
                }, function(err){
                    vm.formError = err.data.message;
                    vm.processing = false;
                });
        } else {
            Job.create(service)
                .then(function(){
                    _submitSuccess();
                }, function(err){
                    vm.formError = err.data.message;
                    vm.processing = false;
                });
        }
    }

    function _edit(job) {
        _resetForm();
        $timeout(function(){
            vm.selectedData = angular.copy(job);
            vm.selectedData.endTime = _toDisplayDate(vm.selectedData.endTime);
            vm.selectedData.startTime = _toDisplayDate(vm.selectedData.startTime);
        });
    }

    function _delete(id) {
        vm.deleteId = id;
        Job.delete(id)
            .then(function(res){
                if (res.success){
                    _refreshList(true);
                }
            });
    }

    function _undoDelete() {
        Job.undelete(vm.deleteId)
            .then(function(res){
                if (res.success){
                    _refreshList();
                }
            });
    }

    function _addTask() {
        if (!vm.selectedData.Tasks) {vm.selectedData.Tasks = [];}
        vm.selectedData.Tasks.push({name: '', price: 0});
    }

    function _removeTask(index) {
        if (vm.selectedData.Tasks.length){
            vm.selectedData.Tasks.splice(index, 1);
        }
    }

    function _setService(id) {
        var service = _.find(vm.services, {id: parseInt(id)});
        $timeout(function(){
            vm.selectedData.service = service;
        });
    }

    _refreshList();

    // controller assignment
    vm.removeTask = _removeTask;
    vm.addTask    = _addTask;
    vm.undoDelete = _undoDelete;
    vm.edit       = _edit;
    vm.getForm    = _getForm;
    vm.closeForm  = _closeForm;
    vm.refresh    = _refreshList;
    vm.submitForm = _createOrUpdate;
    vm.clrFilter  = _clearFilter;
    vm.delete     = _delete;
    vm.setService = _setService;
  });
