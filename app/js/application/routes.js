(function (angular) {
    'use strict';

    angular.module('app').config(function ($provide) {

        $provide.decorator('$state', function ($delegate, $stateParams) {

            $delegate.forceReload = function () {
                return $delegate.go($delegate.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            };
            return $delegate;
        });
    }).config(RouteProvider);


    RouteProvider.$inject = ['$stateProvider', '$urlRouterProvider'];

    function RouteProvider($stateProvider, $urlRouterProvider) {
        var path = 'js/application/views/',
            routes = [{
                name: "root",
                url: "/",
                views: {
                    'applicationContainer@': {
                        templateUrl: path + 'index.html',
                        //controller: 'baseController',
                        //controllerAs: '_bc'
                    },
                    'appHeader@': {
                        templateUrl: path + 'header.html',
                    },
                    'mainContent@root': {
                        //templateUrl: 'js/dashboard/views/dashboard.html',
                        //controller: 'dashboardController',
                        //controllerAs: '_dc'
                    },
                    'eventLog@root': {
                        //templateUrl: 'js/eventLog/views/logger.html'
                    }
                }
            }];


        /**
         * ## HTML5 pushState support
         *
         * This enables urls to be routed with HTML5 pushState so they appear in a
         * '/someurl' format without a page refresh
         *
         * The server must support routing all urls to index.html as a catch-all for
         * this to function properly,
         *
         * The alternative is to disable this which reverts to '#!/someurl'
         * anchor-style urls.
         */
            // $locationProvider.html5Mode({
            //     enabled: true,
            //     requireBase: false
            // });
            // $locationProvider.hashPrefix('!');

        angular.forEach(routes, function (route) {
            route.data = {
                debug: location.search.split('debug=')[1] || location.hash.split('debug=')[1]
            };

            $stateProvider.state(route);
        })

        $urlRouterProvider.otherwise(function ($injector) {
            $injector.get('$state').transitionTo('root');
        });
    }


})(window.angular);
