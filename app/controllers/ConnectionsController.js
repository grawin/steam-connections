app.controller('ConnectionsController', ['$scope', '$rootScope', 'loginService', 'userDataService', 'forceGraphService',
  function ($scope, $rootScope, loginService, userDataService, forceGraphService) {

    init();

    /** Initializes the controller. */
    function init() {

      // Loading indicator.
      $scope.isLoading = true;
      $scope.loadingText = "Gathering connection data..."

      // Logged in (primary) user ID.
      $scope.currentUserId = "0";

      // Primary user data.
      $scope.primaryUser = {
        avatarUrl: "",
        name: "",
        // 0 - Offline, 1 - Online, 2 - Busy, 3 - Away, 4 - Snooze, 5 - looking to trade, 6 - looking to play
        onlineStatus: ""
      };

      // ID of the currently selected user.
      $scope.selectedUserId = "0";

      // Friend graph data.
      $scope.nodes = [];
      $scope.links = [];

      // Get current user's steam ID number.
      loginService.getLoginId().then(function (steamId) {

          $scope.currentUserId = steamId;
          // Default selected user to primary user.
          $scope.selectedUserId = steamId;

          // Get primary user's data
          userDataService.getSummary($scope.currentUserId).then(function (data) {

              $scope.primaryUser.avatarUrl = data.avatarmedium;
              $scope.primaryUser.name = data.personaname;
              $scope.primaryUser.onlineStatus = data.personastate;

              buildConnections();
            })
            .catch(function () {
              // TODO - error handling
            });

        })
        .catch(function () {
          $scope.currentUserId = "0";
        });
    }

    /** Gathers all connection data. */
    function buildConnections() {
      // Gather data for current user.
      userDataService.getConnections($scope.currentUserId)
        .then(function (userData) {

          $scope.userData = userData;
          $scope.isLoading = false;
          populateGraph();
        })
        .catch(function () {
          // TODO - error handling...
        });
    }

    /** Populates scope data for drawing D3.js force directed graph. */
    function populateGraph() {

      var graphData = forceGraphService.getGraphData($scope.currentUserId, $scope.userData);

      $scope.nodes = graphData.nodes;
      $scope.links = graphData.links;

      $scope.graphSteamId = $scope.currentUserId;
    }

    /** Re-draws graph on for a different user. */
    $scope.drawGraph = function (steamId) {
      // Update graph data
      var graphData = forceGraphService.getGraphData(steamId, $scope.userData);
      $scope.nodes = graphData.nodes;
      $scope.links = graphData.links;
      // Set graph ID to kick off svg update.
      $scope.graphSteamId = steamId;
    }

}]);
