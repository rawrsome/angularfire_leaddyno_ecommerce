'use strict';

// *inject firebase.js module from bower
var App = angular.module('myApp.home', [
	'ngRoute', 'firebase', 'ui.bootstrap', 'ngAnimate', 'angularSpinner'
	]);

// ====> route declarations
App.config(['$routeProvider', function($routeProvider, $window) {
	$routeProvider.when('/home', {
		templateUrl: 'home/home.html',
		controller: 'HomeCtrl'
	});
}]);
// <==== end route declarations

// connecting with firebase to use 'ref' as callback

		var ref = new Firebase('https://angular-purebox03.firebaseio.com');
		

// ====> HomeCtrl
App.controller('HomeCtrl', [
	'$scope', '$firebaseObject', '$modal', '$firebaseAuth', 
	function($scope, $firebaseObject, $modal, $firebaseAuth) {
		
	}
	]);
// <==== end HomeCtrl 


// ====> AuthCtrl
App.controller('AuthCtrl', [
	'$scope', '$rootScope', '$firebaseObject', '$modal', '$firebaseAuth',
	function($scope, $rootScope, $firebaseObject, $modal, $firebaseAuth) {

		// pass 'ref' to right and read to firebase
		// $rootScope.auth = $firebaseAuth(ref);
		// console.log($rootScope.auth);
		$scope.auth = $firebaseAuth(ref);
		
		
		// ---> login
		$scope.signIn = function() {
			$scope.auth.$authWithPassword({
				email:  $scope.email,
				password: $scope.password
			}).then(function(userData) {
				$scope.alert.message = '';
				console.log('Logged in as: ', userData.uid);
				// console.log(userData.password.email);
				console.log($scope.auth);
				$scope.auth = userData;
				console.log($scope.auth);
			}, function(error) {
				if(error = 'INVALID_EMAIL') {
					$rootScope.alert.message = '';
					console.log('Email invalid or not signed up —  signing you up!');
					// if not register ---> then register and sign in
					$scope.signUp();
				} else if (error = 'INVALID_PASSWORD') {
					console.log('Wrong password!');
				} else {
					console.log(error);
				}
			});
		};
		// <--- end login

		// ---> register
		$scope.signUp = function() {
			$scope.auth.$createUser({
				email: $scope.email,
				password: $scope.password
			}).then(function(userData) {
				// ---> save user profile to database
				var isNewUser = true;

				ref.onAuth(function(userData) {
					if(userData && isNewUser) {
						// save the user's profile into the database so we can list users,
			          	// use them in Security and Firebase Rules, and show profiles
			          	ref.child('users').child(userData.uid).set({
			          		provider: userData.provider,
			          		email: getEmail(userData)
			          	});
					}
				});
				// find a suitable name based on the meta info given by each provider
				function getEmail(userData) {
					switch(userData.provider) {
						case 'password':
							return userData.password.email
							// return authData.password.email.replace(/@.*/, '');
						case 'twitter':
							return userData.twitter.displayName;
						case 'facebook':
							return userData.facebook.displayName;		
					}
				}
				// <--- end save user profile
				console.log("User " + userData.uid + " created successfully!");
				return $scope.auth.$authWithPassword({
					email: $scope.email,
					password: $scope.password
				});
			}).then(function(userData) {
				console.log("Logged in as:", userData.uid);
			}, function(error) {
				if(!error) {
					$rootScope.alert.message = '';
				} else {
					$rootScope.alert.class = 'danger';
					$rootScope.alert.message = 'The username and password combination you entered is invalid.';
				}
			});
		};
		// <--- end register		
	}
	]);
// <==== AuthCtrl


// ====> AlertCtrl
App.controller('AlertCtrl', [
	'$scope', '$rootScope', function($scope, $rootScope) {
		$rootScope.alert = {}
	}
	]);
// <==== end AlertCtrl