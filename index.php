<?php
  require_once(__DIR__.'/assets/libs/steamauth/steamauth.php');
  require_once(__DIR__.'/assets/libs/steamauth/userInfo.php');
?>
  <!DOCTYPE html>
  <html lang="en" data-ng-app="steamApp">

  <head>
    <title>Steam Connections</title>
    <meta charset='utf-8'>
    <base href="/steam/">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Styles and fonts -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
    <link href="https://file.myfontastic.com/n6vo44Re5QaWo8oCKShBs7/icons.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/steam.css">
    <!-- Libraries -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <script src='https://d3js.org/d3.v3.min.js'></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.2/angular.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.2/angular-route.js"></script>
  </head>

  <body>
    <div class="jumbotron">
      <h1>Steam Connections</h1>
      <p>See the connections between your friends.</p>
    </div>
    <div data-ng-view></div>
    <!-- In-house script(s)  -->
    <script src="assets/js/steam.js"></script>
    <!-- Angular app -->
    <script src="app/app.js"></script>
    <script src="app/controllers/ConnectionsController.js"></script>
    <script src="app/controllers/LoginController.js"></script>
    <script src="app/directives/friendGraph.js"></script>
    <script src="app/directives/loadingSpinner.js"></script>
    <script src="app/services/locationService.js"></script>
    <script src="app/services/loginService.js"></script>
    <script src="app/services/userDataService.js"></script>
    <script src="app/services/forceGraphService.js"></script>
  </body>

  </html>
