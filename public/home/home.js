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
var ref = new Firebase('https://angular-purebox02.firebaseio.com/');


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
		$rootScope.auth = $firebaseAuth(ref);


		// ---> login
		$scope.signIn = function() {
			
			$rootScope.auth.$authWithPassword({
				email:  $scope.email,
				password: $scope.password
			}).then(function(authData) {
				$rootScope.alert.message = '';
				console.log('Logged in as: ', authData.uid);
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

			$rootScope.auth.$createUser({
				email: $scope.email,
				password: $scope.password
			}).then(function(authData) {

				// ---> save user profile to database
				var isNewUser = true;

				ref.onAuth(function(authData) {
					if(authData && isNewUser) {
						// save the user's profile into the database so we can list users,
			          	// use them in Security and Firebase Rules, and show profiles
			          	ref.child('users').child(authData.uid).set({
			          		provider: authData.provider,
			          		email: getEmail(authData)
			          	});
					}
				});
				// find a suitable name based on the meta info given by each provider
				function getEmail(authData) {
					switch(authData.provider) {
						case 'password':
							return authData.password.email
							// return authData.password.email.replace(/@.*/, '');
						case 'twitter':
							return authData.twitter.displayName;
						case 'facebook':
							return authData.facebook.displayName;		
					}
				}
				// <--- end save user profile
				console.log('Logged in as: ', authData.uid);
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