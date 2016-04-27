"use strict";angular.module("angularApp",["ngSanitize","ui.router","LocalStorageModule","restangular","angularjs-datetime-picker","ngMask"]).config(["localStorageServiceProvider","RestangularProvider","$httpProvider",function(a,b,c){var d=window.location.hostname;d="localhost"===d?"":d,a.setPrefix("angular").setStorageType("sessionStorage").setStorageCookieDomain(d),b.setBaseUrl("http://localhost:3000/api"),c.interceptors.push("APIInterceptor")}]).service("APIInterceptor",["$rootScope","localStorageService","$q","$injector",function(a,b,c,d){var e=this;e.request=function(d){d.params||(d.params={});var e=null;return e=null===a.token||void 0===a.token?b.get("token"):a.token,d.params.token=e,d||c.when(d)},e.responseError=function(a){return 401===a.status||403===a.status?(b.set("token",null),d.get("$state").transitionTo("auth"),c.reject(a)):c.reject(a)},e.response=function(a){return a}}]).run(["$rootScope","$state","$stateParams","Authorization","Cancan","$window",function(a,b,c,d,e,f){a.$on("$stateChangeStart",function(b,c,f){a.toState=c,a.toStateParams=f,a.search=null,a.page=1,e.isIdentityResolved()&&d.authorize()}),a.$on("$stateChangeSuccess",function(){f.scrollTo(0,0)})}]),angular.module("angularApp").controller("AuthCtrl",["$rootScope","Authentication","localStorageService","$state",function(a,b,c,d){function e(){h.logginIn=!h.logginIn}function f(){c.get("token")&&d.go("app.restricted.dashboard")}function g(){e(),h.errorLogin=null,b.authenticate(h.user).then(function(b){a.token=b.token,c.set("token",b.token),console.clear(),d.go("app.restricted.dashboard"),e()},function(a){h.errorLogin=a.data.message,e()})}var h=this;f(),h.doLogin=g}]),angular.module("angularApp").controller("MainCtrl",["$rootScope","currentUser","localStorageService","$state","Job",function(a,b,c,d,e){function f(){"user"===b.roles[0]&&e.getAll("","","",b.id,new Date).then(function(b){a.todaysJob=b.jobs,b.jobs.length&&jQuery("#modalJob").modal("show")})}a.currentUser=b,a.logout=function(){c.set("token",null),d.go("auth")},a.pageCount=function(a){return Math.ceil(a/10)},a.range=function(a,b,c){c=c||1;for(var d=[],e=a;b>=e;e+=c)d.push(e);return d},f()}]),angular.module("angularApp").controller("UsersCtrl",["User","Role","$timeout","$state",function(a,b,c,d){function e(){q.filter={},q.filter.name="",q.filter.username=""}function f(){q.showForm=!0,q.formError=null,q.formSuccess=null}function g(){f(),q.uuid=p(),"app.restricted.maid"==d.current.name?(q.selectedUser.username=p(),q.selectedUser.password=p(),q.selectedUser.roleId=3):(q.selectedUser.passport=p(),q.selectedUser.phoneNumber=p(),q.selectedUser.phoneNumberIdn=p(),q.selectedUser.address=p())}function h(){q.showForm=!1,q.selectedUser={},q.processing=!1}function i(b){var c=b||!1;q.loadData=!0,c||(q.deleteId=null),a.getAll(q.filter.name,q.filter.username,q.currentPage,"app.restricted.maid"==d.current.name).then(function(a){q.loadData=!1,q.users=a.users,q.totalPage=a.total})}function j(b){function d(){q.formSuccess=!0,c(function(){h(),i()},600)}q.formError=null,q.processing=!0,b.id?a.update(b).then(function(){d()},function(a){q.formError=a.data.message,q.processing=!1}):a.create(b).then(function(){d()},function(a){q.formError=a.data.message,q.processing=!1})}function k(){b.getAll().then(function(a){q.roles=a.roles})}function l(a){var b=new Date(a);return b.getDate()+"-"+(b.getMonth()+1)+"-"+b.getFullYear()}function m(a){f(),c(function(){q.selectedUser=angular.copy(a),a.Roles&&a.Roles[0]&&(q.selectedUser.roleId=a.Roles[0].id),q.selectedUser.dateOfBirth=l(q.selectedUser.dateOfBirth),delete q.selectedUser.Roles})}function n(b){q.deleteId=b,a["delete"](b).then(function(a){a.success&&i(!0)})}function o(){a.undelete(q.deleteId).then(function(a){a.success&&i()})}function p(){function a(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return a()+a()+"-"+a()+"-"+a()+"-"+a()+"-"+a()+a()+a()}var q=this;q.selectedUser={},q.selectedUser.isActive=!0,q.currentPage=1,e(),k(),i(),q.undoDelete=o,q.editUser=m,q.getForm=g,q.closeForm=h,q.refresh=i,q.submitForm=j,q.clrFilter=e,q.deleteUser=n}]),angular.module("angularApp").controller("ServicesCtrl",["Service","$timeout",function(a,b){function c(a){for(var b=angular.copy(a),c=[],d=2;b.length>0;)c.push(b.splice(0,d));return c}function d(){o.filter={},o.filter.name="",o.filter.username=""}function e(){o.showForm=!0,o.formError=null,o.formSuccess=null}function f(){e()}function g(){o.showForm=!1,o.selectedData={},o.processing=!1}function h(b){var d=b||!1;o.loadData=!0,d||(o.deleteId=null),a.getAll(o.filter.name,o.currentPage).then(function(a){if(o.loadData=!1,o.services=a.services,o.services&&o.services.length)for(var b=0;b<o.services.length;b++)o.services[b].Tasks&&o.services[b].Tasks.length&&(o.services[b].chunkTasks=c(o.services[b].Tasks));o.totalPage=a.total})}function i(c){function d(){o.formSuccess=!0,b(function(){g(),h()},600)}if(o.formError=null,o.processing=!0,!c.isPackage){c.price=0;for(var e=0;e<c.Tasks.length;e++)c.price+=isNaN(parseInt(c.Tasks[e].price))?0:parseInt(c.Tasks[e].price)}c.id?a.update(c).then(function(){d()},function(a){o.formError=a.data.message,o.processing=!1}):a.create(c).then(function(){d()},function(a){o.formError=a.data.message,o.processing=!1})}function j(a){e(),b(function(){o.selectedData=angular.copy(a),delete o.selectedData.Roles})}function k(b){o.deleteId=b,a["delete"](b).then(function(a){a.success&&h(!0)})}function l(){a.undelete(o.deleteId).then(function(a){a.success&&h()})}function m(){o.selectedData.Tasks||(o.selectedData.Tasks=[]),o.selectedData.Tasks.push({name:"",price:0})}function n(a){o.selectedData.Tasks.length&&o.selectedData.Tasks.splice(a,1)}var o=this;o.selectedData={},o.currentPage=1,d(),h(),o.removeTask=n,o.addTask=m,o.undoDelete=l,o.edit=j,o.getForm=f,o.closeForm=g,o.refresh=h,o.submitForm=i,o.clrFilter=d,o["delete"]=k}]),angular.module("angularApp").controller("JobsCtrl",["Job","$timeout","Batch","$rootScope",function(a,b,c,d){function e(a){if(void 0!==a&&null!==a&&""!==a){var b=a.split(" ")[0].split("-"),c=a.split(" ")[1].split(":");return{year:parseInt(b[2]),month:parseInt(b[1])-1,day:parseInt(b[0]),hour:parseInt(c[0]),minute:parseInt(c[1])}}return null}function f(a){return new Date(a.year,a.month,a.day,a.hour,a.minute)}function g(a){var b=new Date(a);return b.getDate()+"-"+(b.getMonth()+1)+"-"+b.getFullYear()+" "+b.getHours()+":"+b.getMinutes()}function h(){c.execute({users:"/api/users/all?maid=true",services:"/api/services/all"}).then(function(a){if(v.users=[],a.users&&a.users.users&&a.users.users.length)for(var b=0;b<a.users.users.length;b++){var c=a.users.users[b];"superadmin"!==c.Roles[0].name&&"user"!==c.Roles[0].name&&c.isActive&&v.users.push(c)}v.services=a.services.services})}function i(){v.filter={},v.filter.name="",v.filter.username="",v.filter.maidName=""}function j(){v.showForm=!0,v.formError=null,v.formSuccess=null}function k(){j()}function l(){v.showForm=!1,v.selectedData={},v.processing=!1}function m(b){var c=b||!1;v.loadData=!0,c||(v.deleteId=null);var e=0;"user"===d.currentUser.roles[0]&&(e=d.currentUser.id),a.getAll(v.filter.name,v.currentPage,v.filter.maidName,e).then(function(a){v.loadData=!1,v.jobs=a.jobs,v.totalPage=a.total})}function n(c){function d(){v.formSuccess=!0,b(function(){l(),m()},600)}function g(a){return""==a||void 0==a||null==a}function h(a){if(!a)return!1;var b=a.split(":");return b[0]&&b[1]&&b[0]&&!isNaN(parseInt(b[0]))&&parseInt(b[0])<=23?!0:!1}var i=angular.copy(c);v.formError=null,v.processing=!0;var j=e(i.startTime);j&&(i.startTime=f(j));var k=e(i.endTime);k&&(i.endTime=f(k));var n=!1;if(v.selectedData.service&&(n=v.selectedData.service.isPackage),v.selectedData.Service&&(n=v.selectedData.Service.isPackage),n&&v.selectedData.JobsDates&&v.selectedData.JobsDates.length){for(var o=!1,p=v.selectedData.JobsDates.length-1;p>=0;p--){var q=v.selectedData.JobsDates[p];(g(q.date)||g(q.startTime)||g(q.endTime))&&(v.formError=[{message:"Select day cannot be blank."}],o=!0),h(q.startTime)&&h(q.endTime)||(v.formError=[{message:"Start time or end time on day selection not valid."}],o=!0)}if(o)return v.processing=!1,!1}i.id?a.update(i).then(function(){d()},function(a){v.formError=a.data.message,v.processing=!1}):a.create(i).then(function(){d()},function(a){v.formError=a.data.message,v.processing=!1})}function o(a){j(),b(function(){v.selectedData=angular.copy(a),v.selectedData.endTime=g(v.selectedData.endTime),v.selectedData.startTime=g(v.selectedData.startTime)})}function p(b){v.deleteId=b,a["delete"](b).then(function(a){a.success&&m(!0)})}function q(){a.undelete(v.deleteId).then(function(a){a.success&&m()})}function r(a){var c=_.find(v.services,{id:parseInt(a)});b(function(){v.selectedData.service=c})}function s(){v.selectedData.JobsDates||(v.selectedData.JobsDates=[]),v.selectedData.JobsDates.push({name:"",price:0})}function t(a){v.selectedData.JobsDates.length&&v.selectedData.JobsDates.splice(a,1)}function u(a){if(!a)return"-";var b=a.split("-");a=new Date(b[2],b[1],b[0]);var c=Date.now()-a.getTime(),d=new Date(c);return Math.abs(d.getUTCFullYear()-1970)}var v=this;v.selectedData={},v.currentPage=1,h(),i(),m(),v.calculateAge=u,v.removeDate=t,v.addDate=s,v.undoDelete=q,v.edit=o,v.getForm=k,v.closeForm=l,v.refresh=m,v.submitForm=n,v.clrFilter=i,v["delete"]=p,v.setService=r}]),angular.module("angularApp").controller("CalendarsCtrl",["Job","$rootScope","$timeout",function(a,b,c){function d(a,b){return a.setDate(a.getDate()+(7+b-a.getDay())%7),a}function e(a){return a.setDate(a.getDate()+1),a}function f(a,b,c){for(var d=new Date(a),e=new Date(b),f=0,g=["Sunday","Monday","Tuesday","Wednesday","Thusday","Friday","Saturday"],h=g.indexOf(c);d.getTime()<=e.getTime();)d.getDay()==h&&f++,d.setDate(d.getDate()+1);return f}function g(a){return a=new Date(a),a.getFullYear()+"-"+("0"+(a.getMonth()+1)).slice(-2)+"-"+("0"+a.getDate()).slice(-2)}function h(a){var b=[],c=["Sunday","Monday","Tuesday","Wednesday","Thusday","Friday","Saturday"];return _.each(a,function(a){a.JobsDates.length?_.each(a.JobsDates,function(h){for(var i=f(a.startTime,a.endTime,h.date),j=new Date(a.startTime),k=new Date(a.endTime),l=0;i>l;l++){var m=d(j,c.indexOf(h.date));j=e(angular.copy(m)),k>=m&&(console.log(b),b.push({title:"Client: "+a.Client.name+"<br />Address: "+a.Client.address+"<br />Maid: "+a.User.name,start:g(m)+"T"+h.startTime+":00.000Z",end:g(m)+"T"+h.endTime+":00.000Z",id:a.id}))}}):b.push({title:"Client: "+a.Client.name+"<br />Address: "+a.Client.address+"<br />Maid: "+a.User.name,start:a.startTime,end:a.endTime,id:a.id})}),b}function i(a){var b=void 0!==a?a.format("YYYY-MM-DD"):moment().format("YYYY-MM-DD");c(function(){jQuery("#calendar").fullCalendar({header:{left:"prev,next",center:"title",right:"prev,next"},editable:!1,eventStartEditable:!1,defaultDate:b,events:m.events,nextDayThreshold:"00:00:00",eventRender:function(a,b){b.find("span.fc-title").html(b.find("span.fc-title").text())},eventClick:function(a){c(function(){m.job=_.find(m.jobs,{id:a.id})}),jQuery("#modalCal").modal("show")}})},0)}function j(c,d){m.gettingData=!0;var e=0;"user"===b.currentUser.roles[0]&&(e=b.currentUser.id),a.getAll("","","",e,c,d).then(function(a){jQuery("#calendar").fullCalendar("removeEvents"),m.jobs=angular.copy(a.jobs),m.events=h(a.jobs),m.isInitiate?jQuery("#calendar").fullCalendar("addEventSource",m.events):(m.isInitiate=!0,i(moment(c))),m.gettingData=!1})}function k(a){var b=new Date(a.year(),a.month(),1),c=new Date(a.year(),a.month()+1,0);j(b,c)}function l(){var a=new Date;k(moment(a))}var m=this;jQuery("body").on("click.myEvent","button.fc-prev-button",function(){var a=jQuery("#calendar").fullCalendar("getDate");k(a)}),jQuery("body").on("click.myEvent","button.fc-next-button",function(){var a=jQuery("#calendar").fullCalendar("getDate");k(a)}),l()}]),angular.module("angularApp").factory("Authentication",["Restangular",function(a){return{authenticate:function(b){return a.all("authenticate").customPOST(b,null,{},{})}}}]),angular.module("angularApp").factory("Authorization",["$rootScope","$state","Cancan",function(a,b,c){return{authorize:function(){return c.identity().then(function(){var d=c.isAuthenticated();void 0!==a.toState.data&&a.toState.data.roles&&a.toState.data.roles.length>0&&!c.isInAnyRole(a.toState.data.roles)&&(d?b.go("app.restricted.dashboard"):(a.returnToState=a.toState,a.returnToStateParams=a.toStateParams,b.go("auth")))})}}}]),angular.module("angularApp").factory("Cancan",["$q","$http","User",function(a,b,c){var d=void 0,e=!1;return{isIdentityResolved:function(){return angular.isDefined(d)},isAuthenticated:function(){return e},isInRole:function(a){return e&&d.roles?-1!==d.roles.indexOf(a):!1},isInAnyRole:function(a){if(!d)return!1;if(!e||!d.roles)return!1;for(var b=0;b<a.length;b++)if(this.isInRole(a[b]))return!0;return!1},authenticate:function(a){d=a,e=null!==a},identity:function(b){var f=a.defer();return b===!0&&(d=void 0),angular.isDefined(d)?(f.resolve(d),f.promise):(c.me().then(function(a){d=a.user,e=!0,f.resolve(d)},function(){d=null,e=!1,f.resolve(d)}),f.promise)}}}]),angular.module("angularApp").factory("User",["Restangular",function(a){return{me:function(){return a.one("users/me").get()},create:function(b){return a.all("users/create").customPOST({user:b},null,{},{})},update:function(b){return a.all("users/update").customPOST({user:b},null,{},{})},"delete":function(b){return a.all("users").customDELETE("delete?userId="+b,{})},undelete:function(b){return a.all("users/undelete").customPOST({userId:b},null,{},{})},getAll:function(b,c,d,e){return a.one("users/all?filterName="+b+"&filterUsername="+c+"&page="+d+"&maid="+e).get()}}}]),angular.module("angularApp").factory("Role",["Restangular",function(a){return{getAll:function(){return a.one("roles/all").get()}}}]),angular.module("angularApp").factory("Service",["Restangular",function(a){return{me:function(){return a.one("services/me").get()},create:function(b){return a.all("services/create").customPOST({service:b},null,{},{})},update:function(b){return a.all("services/update").customPOST({service:b},null,{},{})},"delete":function(b){return a.all("services").customDELETE("delete?id="+b,{})},undelete:function(b){return a.all("services/undelete").customPOST({id:b},null,{},{})},getAll:function(b,c){return a.one("services/all?filterName="+b+"&page="+c).get()}}}]),angular.module("angularApp").factory("Job",["Restangular",function(a){return{me:function(){return a.one("jobs/me").get()},create:function(b){return a.all("jobs/create").customPOST({job:b},null,{},{})},update:function(b){return a.all("jobs/update").customPOST({job:b},null,{},{})},"delete":function(b){return a.all("jobs").customDELETE("delete?id="+b,{})},undelete:function(b){return a.all("jobs/undelete").customPOST({id:b},null,{},{})},getAll:function(b,c,d,e,f,g){var h=f||0,i=g||0;return a.one("jobs/all?filterName="+b+"&page="+c+"&maidName="+d+"&userId="+e+"&startAt="+h+"&endAt="+i).get()}}}]),angular.module("angularApp").factory("Batch",["Restangular",function(a){return{execute:function(b){var c=jQuery.param(b);return a.one("batch?"+c).get()}}}]),angular.module("angularApp").directive("checkMenuAuthorized",["$state","Cancan",function(a,b){return{restrict:"A",link:function(c,d){var e=jQuery(d),f=e.attr("ui-sref"),g=a.get(f);void 0!==g.data&&g.data.roles&&g.data.roles.length>0&&!b.isInAnyRole(g.data.roles)?e.hide():e.show()}}}]),angular.module("angularApp").config(["$stateProvider","$urlRouterProvider",function(a,b){b.otherwise("/dashboard"),b.when("","/dashboard"),a.state("auth",{url:"/login",templateUrl:"views/auth/index.html",controller:"AuthCtrl",controllerAs:"vm"}).state("app",{url:"","abstract":!0,templateUrl:"views/layouts/application.html",controller:"MainCtrl",params:{token:null},resolve:{currentUser:["Cancan",function(a){return a.identity(!0)}]}}).state("app.restricted",{url:"","abstract":!0,templateUrl:"views/layouts/application.html",resolve:{authorize:["Authorization",function(a){return a.authorize()}]}}).state("app.restricted.dashboard",{url:"/dashboard",templateUrl:"views/dashboards/index.html",controllerAs:"vm",data:{roles:["superadmin","user"]}}).state("app.restricted.users",{url:"/users",templateUrl:"views/users/index.html",controller:"UsersCtrl",controllerAs:"vm",data:{roles:["superadmin"]}}).state("app.restricted.maid",{url:"/maid",templateUrl:"views/maid/index.html",controller:"UsersCtrl",controllerAs:"vm",data:{roles:["superadmin"]}}).state("app.restricted.services",{url:"/services",templateUrl:"views/services/index.html",controller:"ServicesCtrl",controllerAs:"vm",data:{roles:["superadmin"]}}).state("app.restricted.jobs",{url:"/jobs",templateUrl:"views/jobs/index.html",controller:"JobsCtrl",controllerAs:"vm",data:{roles:["superadmin","user"]}}).state("app.restricted.calendars",{url:"/calendars",templateUrl:"views/calendars/index.html",controller:"CalendarsCtrl",controllerAs:"vm",data:{roles:["superadmin","user"]},onExit:function(){jQuery(".ui.dimmer.modals").remove()}})}]);