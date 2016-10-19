'use strict';

angular
  .module('angularApp', [
    'ngSanitize',
    'ui.router',
    'LocalStorageModule',
    'restangular',
    'angularjs-datetime-picker',
    'ngMask'
  ])
  .config(function (localStorageServiceProvider, RestangularProvider, $httpProvider) {
    var domain = window.location.hostname;
        domain = domain === 'localhost' ? '' : domain;
    localStorageServiceProvider
      .setPrefix('angular')
      .setStorageType('sessionStorage')
      .setStorageCookieDomain(domain);

    RestangularProvider
      .setBaseUrl('http://expressnode.azurewebsites.net/api');
      // .setBaseUrl('http://localhost:3000/api');

    $httpProvider.interceptors.push('APIInterceptor');
  })
  .service('APIInterceptor', function($rootScope, localStorageService, $q, $injector) {
    var service = this;

    service.request = function(config) {
      if(!config.params) {
        config.params = {};
      }
      var token   = null;
      if ($rootScope.token === null || $rootScope.token === undefined){
        token = localStorageService.get('token');
      }else {
        token = $rootScope.token;
      }

      config.params.token = token;
      return config || $q.when(config);
    };

    service.responseError = function(rejection) {
      if (rejection.status === 401 || rejection.status === 403) {
        localStorageService.set('token', null);
        $injector.get('$state').transitionTo('auth');
        return $q.reject(rejection);// return to login page
      }else {
        return $q.reject(rejection);
      }
    };

    service.response = function(response) {
      // var data = response.headers('X-Token');
      // if (data){
      //   localStorageService.set('token', data);
      // }

      return response;
    };
  })
  .run(function($rootScope, $state, $stateParams, Authorization, Cancan, $window) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
      // track the state the user wants to go to; authorization service needs this
      $rootScope.toState       = toState;
      $rootScope.toStateParams = toStateParams;
      $rootScope.search        = null;
      $rootScope.page          = 1;
      // if the principal is resolved, do an authorization check immediately. otherwise,
      // it'll be done when the state it resolved.
      if (Cancan.isIdentityResolved()) {
        Authorization.authorize();
      }
    });

    $rootScope.$on('$stateChangeSuccess', function(){ $window.scrollTo(0,0);});
    // $rootScope.$on('$stateChangeError', function(){ ngProgress.complete(); });
  });
