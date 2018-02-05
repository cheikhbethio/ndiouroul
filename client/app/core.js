'use strict';

angular.module('pgdApp', [
	'ui.router',
	'siteBody',
	'ui.bootstrap',
	'snap',
	'textAngular',
	'ngStorage',
	//	site
	'accueil',
	'rubrique',
	'connexion',
	'registration',
	'profile',
	'allPoems',
	"connectionService",
	//	management
	'management',
	'manAccueil',
	'poemes',
	'poemeServices',
	'commentsService',
	'comments',
	'user',
	'userService',
	//	common
	'currentUser',
	'underscore',
	'custumModal',
	'myAlerter',

	'angular-carousel',

])
	.config(['$stateProvider', '$urlRouterProvider',
			function ($stateProvider) {
			$stateProvider
				.state("site", {
					views: {
						'header': {
							templateUrl: 'app/site/body/header.html',
							controller: 'siteBodyController',
							css: 'assets/css/body/header.css'
						},
						'title': {
							templateUrl: 'app/site/body/title.html',
							controller: 'siteBodyController',
							css: 'assets/css/body/title.css'
						},
						'content': {
							templateUrl: 'app/site/body/content.html',
							controller: 'siteBodyController'
						},
						'footer': {
							templateUrl: 'app/site/body/footer.html',
							css: 'assets/css/body/footer.css'
						}
					},
					data: {
						requireLogin: false,
						requireLoginDashboard: false
					}
				})
				.state("dashboard", {
					url: '/dashboard',
					views: {
						'header': {
							templateUrl: 'app/site/body/header.html',
							controller: 'siteBodyController'
						},
						'content': {
							templateUrl: 'app/manager/body/content.html',
							controller: 'manBodyController'
						}
					},
					data: {
						requireLogin: true,
						requireLoginDashboard: true
					}
				});
			}])
	.run(function (connectionFactory) {
		connectionFactory.connectionRedirection.dashboard();
	});
