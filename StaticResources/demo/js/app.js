(function(angular) {
    'use strict';

    angular.module('loan-app.core', [
        'loan-app.applist',
        // 3rd party
        'ui.router', 'ui.bootstrap', 'ngDialog', 'textAngular', 'ngSanitize', 'dialogs', 'ngLoadingSpinner', 'checklist-model'
    ])

    .value('GlobalCfg', {
            remotingConfiguration: {
                buffer: true,
                escape: false,
                timeout: 30000,
                maxretries: 3
            }
        })
        .config(['$sceProvider', function($sceProvider) {
            $sceProvider.enabled(false);
        }])
        .config(function($stateProvider, $urlRouterProvider) {
            //console.log('hello');
            // Now set up the states
            $stateProvider
                .state('container', {
                    url: '/container',
                    //abstract: true,
                    templateUrl: VFPageData.resources.app_base + 'templates/core/container.html',
                    controller: function($scope) {
                            $scope.UserDetail = VFPageData.User.Name;
                        }
                        //controller: 'ApplicationListingCtrl'
                })

            .state('container.applist', {
                url: "/applist",
                templateUrl: VFPageData.resources.app_base + "templates/applist/index.html",
                controller: 'ApplicationListingCtrl'
            })

            .state('container.appverify', {
                    url: "/appverify/:appid/:state",
                    templateUrl: VFPageData.resources.app_base + "templates/appverify/index.html",
                    controller: 'ApplicationVerificationCtrl'
                })
                .state('container.appverify.state', {
                    url: "/:state/:id",
                    templateUrl: function($stateParams) {
                        if ($stateParams.state.toLowerCase() == 'docs') {
                            return VFPageData.resources.app_base + "templates/state/docs.html";
                        } else {
                            return VFPageData.resources.app_base + "templates/state/common.html";
                        }
                    },
                    onEnter: function() {
                        //console.log($stateParams);
                    },
                    controller: "verificationStepCtrl"
                })

            //$urlRouterProvider.when("container/appverify/:id", "container/appverify/identity");  
            $urlRouterProvider.otherwise("/container/applist");

        })
})(window.angular);
