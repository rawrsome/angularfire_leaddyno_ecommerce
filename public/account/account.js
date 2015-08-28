'use strict';

var App = angular.module('myApp.account', [
	'ngRoute', 'firebase', 'ui.bootstrap', 'ngAnimate', 'angularSpinner'
	]);

// ====> route declarations
App.config(['$routeProvider', function($routeProvider, $window) {
	$routeProvider.when('/account', {
		templateUrl: 'account/account.html',
		controller: 'AccountCtrl'
	});
}]);
// <==== end route declarations

// ====> AccountCtrl
App.controller('AccountCtrl', [
	'currentAuth', '$scope', '$firebaseObject', '$modal', '$firebaseAuth', 'AuthFactory',
	function(currentAuth, $scope, $firebaseObject, $modal, $firebaseAuth, AuthFactory) {
		// currentAuth (provided by resolve) will contain the
 		// authenticated user or null if not logged in
	}
	]);
// <==== end AccountCtrl 