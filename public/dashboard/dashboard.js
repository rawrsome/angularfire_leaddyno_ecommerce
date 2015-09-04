'use strict';

var App = angular.module('myApp.dashboard', [
	'ngRoute', 'firebase', 'ui.bootstrap', 'ngAnimate', 'angularSpinner',
	]);


// ====> Declared route 
App.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/dashboard', {
        templateUrl: 'dashboard/dashboard.html',
        controller: 'DashboardCtrl'
    });
}]);

// ====> Dahsboard controller
App.controller("DashboardCtrl", [
	'$scope', '$firebaseObject',
	function($scope, $firebaseObject) {
		
		var ref = new Firebase('https://angular-purebox03.firebaseio.com/');

		var productsRef = ref.child('products');

		$scope.addProduct = function(product) {
			$scope.product = product;

			$scope.product = $firebaseObject(productsRef);

			productsRef.push({
				title: product.title,
				price: product.price
			});
			console.log($scope.product);
		};
	}]);
// <==== end Dashboard controller