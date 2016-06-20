'use strict';

angular.module('angularApp')
  .controller('CalendarsCtrl', function (Job, $rootScope, $timeout, currentUser, localStorageService) {
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

                            events.push({
                                title: 'Client: ' + item.Client.name + '<br />Address: '+item.Client.address+'<br />Maid: '+ item.User.name+'<br />Price: RM '+item.Service.price+'<br />Total hour: '+itm.hour+ ' hour(s)',
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

    function checkArr(data, key, q){
        var retrn = false;
        for (var i = 0; i < data.length; i++) {
            var itm = data[i];
            if(itm[key] === q){
                retrn = true;
                break;
            }
        }
        return retrn;
    }

    function _checkTodaysJob() {
        var dates = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var d     = new Date();
        var tody  = dates[d.getDay()];

        //if (currentUser.roles[0] === 'user'){
            Job.getAll('', '', '', 0, new Date())
                .then(function(res){
                    $rootScope.todaysJob = res.jobs;
                    var jobsCount   = res.jobs.length;
                    var jobsDetails = [];

                    if (jobsCount) {
                        for (var i = 0; i < jobsCount; i++) {
                            var itm = res.jobs[i];
                            if (itm.Service.isPackage){
                                // check day
                                var hasTodayData = checkArr(itm.JobsDates, 'date', tody);
                                if (hasTodayData) jobsDetails.push(itm);
                            } else jobsDetails.push(itm);
                        }
                    }

                    var jobsDetailCount = jobsDetails.length;
                    for (var i = 0; i < jobsDetailCount; i++) {
                        var itm = jobsDetails[i];

                        var viewedData = localStorageService.get(currentUser.username);
                        if (!viewedData || (viewedData && viewedData.indexOf(itm.id) > -1)){
                            var html = '<div data-id="'+itm.id+'" class="hovering"></div><div ><h4 >Todays job</h4>';
                            html += '<p style="margin-bottom: 5px">Client name: '+itm.Client.name+'</p>';
                            html += '<p style="margin-top: 0">Address: '+itm.Client.address;
                            html += '<br>Client email: '+itm.Client.email;
                            html += '<br>Client phone: '+itm.Client.phone;
                            html += '<br>Maid: '+itm.User.name;
                            html += '<br>Price: RM '+itm.Service.price;
                            html += '</p></div>';
                            var n = noty({text: html});
                        }
                    };
                });
        //}
    }

    $.noty.closeAll();
    _checkTodaysJob();

    $.noty.defaults = {
        layout: 'bottomRight',
        theme: 'defaultTheme', // or 'relax'
        type: 'information',
        text: '', // can be html or string
        dismissQueue: true, // If you want to use queue feature set this true
        template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
        animation: {
            open: {height: 'toggle'}, // or Animate.css class names like: 'animated bounceInLeft'
            close: {height: 'toggle'}, // or Animate.css class names like: 'animated bounceOutLeft'
            easing: 'swing',
            speed: 500 // opening & closing animation speed
        },
        timeout: false, // delay for closing event. Set false for sticky notifications
        force: false, // adds notification to the beginning of queue when set to true
        modal: false,
        maxVisible: 15, // you can set max visible notification for dismissQueue true option,
        killer: false, // for close all notifications before show
        closeWith: ['click'], // ['click', 'button', 'hover', 'backdrop'] // backdrop click will close all notifications
        callback: {
            onShow: function() {},
            afterShow: function() {},
            onClose: function() {},
            afterClose: function() {},
            onCloseClick: function(c,s) {
                var viewedData = localStorageService.get(currentUser.username);
                if (!viewedData) viewedData = [];
                var idx = $(c.target).attr('data-id');
                if (viewedData.indexOf(idx)  < 0)
                    viewedData.push(idx)

                localStorageService.set(currentUser.username,viewedData);
            },
        },
        buttons: false // an array of buttons
    };

  });
