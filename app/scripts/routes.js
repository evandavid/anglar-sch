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
                controller: function($rootScope, currentUser){
                    $rootScope.currentUser = currentUser;
                },
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
                    template: '<div ui-view> </div>',
                    resolve: {
                        authorize: ['User', function(Authorization) {
                            return Authorization.authorize();
                        }]
                    }
                })
                    .state('app.restricted.dashboard', {
                        url: '/dashboard',
                        templateUrl: 'views/layouts/application.html',
                        controller: function(){
                            console.log('tains');
                        },
                        data: {
                            roles: ['superadmin']
                        },
                    });
    });