(function(angular, window) {
    'use strict';

    var app = angular.module('loan-app.applist', ['ui.multiselect', 'ui.bootstrap', 'datatables', 'datatables.bootstrap', 'dialogs', 'ngLoadingSpinner', 'checklist-model'])

    .service('applicationListService', function($q, $rootScope, GlobalCfg) {
        var _sharedRemoteResponseHandler = function(result, event, deferred) {
            $rootScope.$apply(function() {
                if (event.status) {
                    deferred.resolve(result);
                } else if (event.type === 'exception') {
                    alert(event.message);
                    deferred.reject(event);
                } else {   
                    deferred.reject(event);
                }
            })
        };

        return {
            getAccountList: function(criteria, callback) {
                //console.log(criteria);
                var deferred = $q.defer();
                Visualforce.remoting.Manager.invokeAction(VFPageData.remoteActions.getAccountList, criteria, function(result, event) {
                    _sharedRemoteResponseHandler(result, event, deferred);
                }, GlobalCfg.remotingConfiguration);
                return deferred.promise;
            }
        } //return
    }).controller('ApplicationListingCtrl', function(applicationListService, $q, $scope, $compile, $filter, DTOptionsBuilder, DTColumnBuilder, DTDefaultOptions, DTColumnDefBuilder) {

            // $scope.UserDetail = VFPageData.User.Name;
            //todo: do it via root scope
			
			applicationListService.getAccountList($stateParams.appid,$scope.customerdetail.assignee).then(function(response){
				//console.log(response);
			}, function(error) {
				//alert(error);
			});

	});
    app.filter('nullcurrency', ['$filter', function($filter) {
        return function(amount, currencySymbol) {
            if (amount === '' || amount === null)
                return '';
            else
                return $filter("currency")(amount, currencySymbol);
        };
    }]);
})(window.angular, window);