'use strict';

angular
    .module('angularApp')
    .config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/dashboard');
        $urlRouterProvider.when('', '/dashboard');

        $stateProvider
            .state('auth', {
                url: '/login',
                templateUrl: 'views/auth/index.html',
                controller: 'AuthCtrl',
                controllerAs: 'vm'
            })
            .state('app', {
                url: '',
                abstract: true,
                templateUrl: 'views/layouts/application.html',
                controller: 'MainCtrl',
                params: { token: null },
                resolve: {
                    currentUser: ['Cancan', function(Cancan){
                        return Cancan.identity(true);
                    }]
                }
            })
                .state('app.restricted', {
                    url: '',
                    abstract: true,
                    templateUrl: 'views/layouts/application.html',
                    resolve: {
                        authorize: ['Authorization', function(Authorization) {
                            return Authorization.authorize();
                        }]
                    }
                })
                    .state('app.restricted.dashboard', {
                        url: '/dashboard',
                        templateUrl: 'views/dashboards/index.html',
                        controllerAs: 'vm',
                        data: {
                            roles: ['superadmin', 'user']
                        },
                    })
                    .state('app.restricted.users', {
                        url: '/users',
                        templateUrl: 'views/users/index.html',
                        controller: 'UsersCtrl',
                        controllerAs: 'vm',
                        data: {
                            roles: ['superadmin']
                        },
                    })
                    .state('app.restricted.services', {
                        url: '/services',
                        templateUrl: 'views/services/index.html',
                        controller: 'ServicesCtrl',
                        controllerAs: 'vm',
                        data: {
                            roles: ['superadmin']
                        },
                    });
    });