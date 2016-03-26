'use strict';

angular.module('angularApp')
  .controller('CalendarsCtrl', function (Job, $rootScope, $timeout) {
    var vm = this;

    // next and prev month button clicked
    jQuery('body').on('click.myEvent', 'button.fc-prev-button', function () {
        var currentDate = jQuery('#calendar').fullCalendar('getDate');
        _renderByDate(currentDate);
    });

    jQuery('body').on('click.myEvent', 'button.fc-next-button', function () {
        var currentDate = jQuery('#calendar').fullCalendar('getDate');
        _renderByDate(currentDate);
    });

    function _constructEvent(data) {
        var events = [];
        _.each(data, function (item) {
            events.push({
                title: 'Client: ' + item.Client.name + '<br />Address: '+item.Client.address+'<br />Maid: '+ item.User.name,
                start: item.startTime,
                end: item.endTime,
                id: item.id
            });
        });

        return events;
    }

    function _renderCalendar(_defaultDate) {
        var defaultDate = _defaultDate !== undefined ? _defaultDate.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
        $timeout(function(){
            jQuery('#calendar').fullCalendar({
                header: {
                    left: 'prev,next',
                    center: 'title',
                    right: 'prev,next',
                },
                editable: false,
                eventStartEditable: false,
                defaultDate: defaultDate,
                events: vm.events,
                nextDayThreshold: '00:00:00',
                eventRender: function (event, element) {
                    element.find('span.fc-title').html(element.find('span.fc-title').text());
                },
                eventClick: function (calEvent) {
                    $timeout(function(){
                        vm.job = _.find(vm.jobs, {id: calEvent.id});
                    });
                    jQuery('#modalCal').modal('show');
                }
            });
        },0);
    }

    function _getData(startAt, endAt) {
        vm.gettingData = true;
        var userId = 0;
        if ($rootScope.currentUser.roles[0] === 'user'){
            userId = $rootScope.currentUser.id;
        }

        Job.getAll('', '', '', userId, startAt, endAt)
            .then(function(res){
                jQuery('#calendar').fullCalendar( 'removeEvents');
                vm.jobs = angular.copy(res.jobs);

                vm.events = _constructEvent(res.jobs);
                if (vm.isInitiate){
                    jQuery('#calendar').fullCalendar('addEventSource', vm.events);
                } else {
                    vm.isInitiate = true;
                    _renderCalendar(moment(startAt));
                }
                vm.gettingData = false;
            });
    }

    function _renderByDate(date){
        var thisMonthFirstDay = new Date(date.year(), date.month(), 1);
        var thisMonthLastDay = new Date(date.year(), (date.month()+1), 0);

        _getData(thisMonthFirstDay, thisMonthLastDay);
    }

    function _initial() {
        var today = new Date();
        _renderByDate(moment(today));
    }

    _initial();

  });
