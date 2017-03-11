// Define main module
var app = angular.module('steamApp', ['ngRoute']);

// Configure routes with views and controllers
app.config(function ($routeProvider, $locationProvider, $logProvider) {
  $routeProvider
    .when('/login', {
      controller: 'LoginController',
      templateUrl: '/steam/app/views/login.html',
      resolve: {
        function (loginService, $location) {
          loginService.getLoginId().then(function (loginId) {
            // If already logged in, go to connections.
            if (loginId && loginId != 0 && loginId != "0") {
              $location.path('/connections');
            } else {
              $location.path('/login');
            }
          });
        }
      }
    })
    // Route for main connections display page
    .when('/connections', {
      controller: 'ConnectionsController',
      templateUrl: '/steam/app/views/connections.html'
    })
    // Default to login page
    .otherwise({
      redirectTo: '/login'
    });

  // Use the HTML5 History API for URLs without #
  $locationProvider.html5Mode(true);

  // Disable logging in production.
  $logProvider.debugEnabled(false);
});
