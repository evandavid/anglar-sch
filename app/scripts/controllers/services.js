'use strict';

angular.module('angularApp')
  .controller('ServicesCtrl', function (Service, Role, $timeout) {
    var vm = this;
    vm.selectedData = {};
    vm.currentPage = 1;

    function _chunkArray(data) {
        var a = angular.copy(data);
        var arrays = [], size = 2;
        while (a.length > 0){
            arrays.push(a.splice(0, size));
        }

        return arrays;
    }

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
        vm.selectedData = {};
        vm.processing = false;
    }

    function _refreshList(dontHideUndo) {
        var _dontHideUndo = dontHideUndo || false;
        vm.loadData = true;
        if (!_dontHideUndo) { vm.deleteId = null; }

        Service.getAll(vm.filter.name, vm.currentPage)
            .then(function(res){
                vm.loadData = false;
                vm.services = res.services;
                if (vm.services && vm.services.length){
                    for(var i =0; i < vm.services.length; i++){
                        if (vm.services[i].Tasks && vm.services[i].Tasks.length){
                            vm.services[i].chunkTasks = _chunkArray(vm.services[i].Tasks);
                        }
                    }
                }

                vm.totalPage = res.total;
            });
    }

    function _createOrUpdate(service) {
        vm.formError = null;
        vm.processing = true;

        if (!service.isPackage){
            // not a package, need to calculate price
            service.price = 0;
            for (var i=0; i < service.Tasks.length; i++) {
                service.price += isNaN(parseInt(service.Tasks[i].price))?0:parseInt(service.Tasks[i].price);
            }
        }

        function _submitSuccess() {
            vm.formSuccess = true;
            $timeout(function(){
                _closeForm();
                _refreshList();
            }, 600);
        }

        if (service.id) {
            Service.update(service)
                .then(function(){
                    _submitSuccess();
                }, function(err){
                    vm.formError = err.data.message;
                    vm.processing = false;
                });
        } else {
            Service.create(service)
                .then(function(){
                    _submitSuccess();
                }, function(err){
                    vm.formError = err.data.message;
                    vm.processing = false;
                });
        }
    }

    function _edit(service) {
        _resetForm();
        $timeout(function(){
            vm.selectedData = angular.copy(service);
            delete vm.selectedData.Roles;
        });
    }

    function _delete(id) {
        vm.deleteId = id;
        Service.delete(id)
            .then(function(res){
                if (res.success){
                    _refreshList(true);
                }
            });
    }

    function _undoDelete() {
        Service.undelete(vm.deleteId)
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
  });
