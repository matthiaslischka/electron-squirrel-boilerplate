/**
 * Created by redroger on 3/14/15.
 */

(function (angular) {
	'use strict';

	angular.module('app').factory('APP_OVERRIDE', AppOverride);

	AppOverride.$inject = ['utilities','$templateCache', '$http'];

	function AppOverride(utilities, $templateCache, $http) {

		var override = {
			//loggerHost:"localhost" //used to override the debug functionality
			env: 'production'
		};
		return override;
	}

})(window.angular);
