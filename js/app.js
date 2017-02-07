var owner = "";
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCookies','nvd3','ngCordova'])
    .run(function($ionicPlatform, $http, Login, $state) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
            if (Login.getObject("loggedin") === "true" && Login.getObject("username") !== "" && Login.getObject("username") !== undefined) {
                Login.startsync(Login.getObject("username"));
                $state.go("landing");
            }
        });
    })
    .config(function($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider) {
        $ionicConfigProvider.tabs.position('bottom');
        $httpProvider.defaults.cache = false;
        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider
        // setup an abstract state for the tabs directive            
			.state('landing', {
                url: '/landing',
                //cache: false,
                templateUrl: 'templates/landing.html',
                controller: 'landingcontroller'
            })
            .state('signin', {
                url: '/sign-in',
                templateUrl: 'templates/sign-in.html',
                controller: 'SignInCtrl'
            })            
			.state('attendance', {
                url: '/attendance',
                cache: false,
				controller: 'attendancecontroller',
				templateUrl: 'templates/attendance.html'				                
            })
			.state('aboutus', {
                url: '/aboutus',
                cache: false,
				controller: 'aboutuscontroller',
				templateUrl: 'templates/aboutus.html'				                
            })
			.state('contactus', {
                url: '/contactus',
                cache: false,
				controller: 'contactuscontroller',
				templateUrl: 'templates/contactus.html'				                
            })
			.state('timetable', {
                url: '/timetable',
                cache: false,
				controller: 'timetablecontroller',
				templateUrl: 'templates/timetable.html'				                
            })
			.state('reportLanding', {
                url: '/reportLanding',
                cache: false,
				controller: 'reportLandingcontroller',
				templateUrl: 'templates/reportLanding.html'				                
            })
			.state('pastReports', {
                url: '/pastReports',
                cache: false,
				controller: 'pastReportscontroller',
				templateUrl: 'templates/pastReports.html'				                
            })
			.state('weeklyreport', {
                url: '/weeklyreport',
                cache: false,
				controller: 'weeklyreportcontroller',
				templateUrl: 'templates/weeklyreport.html'				                
            })
			.state('gallery1', {
                url: '/gallery1',
                cache: false,
				controller: 'gallery1controller',
				templateUrl: 'templates/gallery1.html'				                
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/sign-in');
    });
