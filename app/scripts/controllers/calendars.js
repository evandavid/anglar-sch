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

    function setDay(date, dayOfWeek) {
        date.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
        return date;
    }

    function getNextDay(date){
        date.setDate(date.getDate() + 1);
        return date;
    }

    function getCountOf( date1, date2, dayToSearch ){
        var dateObj1 = new Date(date1);
        var dateObj2 = new Date(date2);

        var count = 0;
        var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thusday", "Friday", "Saturday"];
        var dayIndex = week.indexOf( dayToSearch );

        while ( dateObj1.getTime() <= dateObj2.getTime() )
        {
           if (dateObj1.getDay() == dayIndex )
           {
              count++
           }

           dateObj1.setDate(dateObj1.getDate() + 1);
        }

        return count;
    }

    function _getDateOnly(date){
        date = new Date(date);
        return date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    }

    function _constructEvent(data) {
        var events = [];
        var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thusday", "Friday", "Saturday"];
        _.each(data, function (item) {

            if (item.JobsDates.length){
                _.each(item.JobsDates, function(itm){
                    var dayCount = getCountOf(item.startTime, item.endTime, itm.date);

                    var start = new Date(item.startTime);
                    var end = new Date(item.endTime);

                    for (var i=0; i < dayCount; i++){
                        var nextDay = setDay(start, week.indexOf( itm.date ));
                        start = getNextDay(angular.copy(nextDay));
                        if (nextDay <= end){
                            // insert to calendar

                            console.log(events)
                            events.push({
                                title: 'Client: ' + item.Client.name + '<br />Address: '+item.Client.address+'<br />Maid: '+ item.User.name,
                                start: _getDateOnly(nextDay)+'T'+itm.startTime+':00.000Z',
                                end: _getDateOnly(nextDay)+'T'+itm.endTime+':00.000Z',
                                id: item.id
                            });
                        }
                    }
                })
            }
            else {
                events.push({
                    title: 'Client: ' + item.Client.name + '<br />Address: '+item.Client.address+'<br />Maid: '+ item.User.name,
                    start: item.startTime,
                    end: item.endTime,
                    id: item.id
                });
            }
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
