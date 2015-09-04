'use strict';

// *inject firebase.js module from bower
var App = angular.module('myApp.home', [
	'ngRoute', 'firebase', 'ui.bootstrap', 'ngAnimate', 'angularSpinner','angularPayments', 'ngCookies'
	]);

// ====> route declarations
App.config(['$routeProvider', function($routeProvider, $window) {

	recurly.configure('sjc-17qcx07uRgUUxXLBx4HIAw');
	// window.Stripe.setPublishableKey('pk_test_ir3pQ7Xr2fy8TgUcYrDWXmkG');

	$routeProvider.when('/home', {
		templateUrl: 'home/home.html',
		controller: 'HomeCtrl'
	});
}]);
// <==== end route declarations

// connecting with firebase to use 'ref' as callback
var ref = new Firebase('https://angular-purebox03.firebaseio.com/');
		

// ====> HomeCtrl
App.controller('HomeCtrl', [
	'$scope', '$firebaseObject', '$modal', '$firebaseAuth',
	function($scope, $firebaseObject, $modal, $firebaseAuth) {
		// if ($location.path() === '') {
		// 	$location.path('home/home.html');
		// }
		$scope.animationsEnabled = true;
		$scope.cart = [];

		$scope.products = $firebaseObject(ref.child('products'));
		console.log($scope.products);

		$scope.addToCart = function(product) {
			var found = false;
			$scope.cart.forEach(function(item) {
				if(item.id === product.id) {
					item.quantity++;
					found = true;
				}
			});
			if(!found) {
				$scope.cart.push(angular.extend({
					quantity: 1
				}, product));
			}
		};

		$scope.getCartPrice = function() {
			var total = 0;
			$scope.cart.forEach(function(product) {
				total += product.price * product.quantity;
			});
			return total;
		}
 		
		$scope.checkOut = function() {
			console.log('Launching checkout modal ====>');
			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'checkout/checkout.html',
				controller: 'HomeCtrl',
				resolve: {
					totalAmount: $scope.getCartPrice
				}
			})
		};

		$scope.toggleAnimation = function () {
		    $scope.animationsEnabled = !$scope.animationsEnabled;
		};


		// $scope.totalAmount = totalAmount;

		// $scope.onSubmit = function() {
		// 	$scope.processing = true;
		// };
		console.log('in CheckoutCtrl!');
		$scope.handleRecurly = function(status, res) {
			console.log('in CheckoutCtrl!');
			if(res.error) {
				console.log(res.error.message);
				$scope.stripeError = res.error.message;
			} else {
				var stripeToken = res.id
	            console.log('GOT TOKEN', stripeToken);
			}
		};

		$scope.hideAlerts = function() {
			$scope.stripeError = null;
			$scope.stripeToken = null;
		};

	}
	]);
// <==== end HomeCtrl 




// ====> AlertCtrl
App.controller('AlertCtrl', [
	'$scope', '$rootScope', function($scope, $rootScope) {
		$rootScope.alert = {}
	}
	]);
// <==== end AlertCtrl


// ====> AuthCtrl
App.controller('AuthCtrl', [
	'$scope', '$rootScope', '$firebaseObject', '$modal', '$firebaseAuth',
	function($scope, $rootScope, $firebaseObject, $modal, $firebaseAuth) {

		// pass 'ref' to right and read to firebase
		$scope.auth = $firebaseAuth(ref);
		var offAuth;
		
		// ---> login
		$scope.signIn = function() {
			$scope.auth.$authWithPassword({
				email:  $scope.email,
				password: $scope.password
			}).then(function(userData) {
				$scope.alert.message = '';

				$scope.auth.$onAuth(function(userData) {
				  	if(userData) {
				    console.log("Logged in as: ", userData.uid);
				  	} else {
				    console.log("Logged out!");
				  	}
				});
				$scope.auth = userData;

			}, function(error) {
				if(error = 'INVALID_EMAIL') {
					$rootScope.alert.message = '';
					console.log('Email invalid or not signed up —  signing you up!');
					// if not register ---> then register and sign in
					$scope.signUp();
				} else if (error = 'INVALID_PASSWORD') {
					console.log('Wrong login or password!');
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
				$scope.auth.$onAuth(function(userData) {
				  	if(userData) {
				    console.log("Logged in as: ", userData.uid);
				  	} else {
				    console.log("Logged out");
				  	}
				});
				$scope.auth = userData;
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


		// ---> unauth user
		$scope.signOut = function() {
			var auth = $firebaseAuth(ref);
			auth.$unauth();
		};
		// <--- end unauth
	}
	]);
// <==== end AuthCtrl