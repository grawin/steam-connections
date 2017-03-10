app.controller('LoginController', ['$scope', '$location', 'loginService', 'userDataService', function ($scope, $location, loginService, userDataService) {
  init();

  /** Initializes the controller. */
  function init() {
    loginService.getLoginId().then(function (loginId) {
      $scope.currentUserId = loginId;
    });
  }

  // TODO - move this to login service...
  /** Validates the provided Steam ID string.
   * Steam ID format: 7656119xxxxxxxxxx
   * @param {string} steamId - The Steam ID.
   */
  function isSteamIdValid(steamId) {
    var re = /^7656119\d{10}/;
    return ((typeof steamId === "string") &&
      re.exec(steamId));
  }

  // TODO - move this to login service...
  /** Validates the provided ID and logs in.
   * @param {string} loginId - The Steam ID.
   */
  function validateAndLogin(loginId) {
    if (isSteamIdValid(loginId)) {
      // Verify user exists and profile is public by checking if friend list is visible.
      userDataService.getFriends(loginId).then(function (friendList) {
          if (friendList.length > 0) {
            // Store login ID
            loginService.setLoginId(loginId).then(function (data) {
              // Now logged in, switch to connections view
              $location.path('connections');
            });
          } else {
            $scope.errorMessage = "Friends list is private, cannot build connections.";
          }
        })
        .catch(function () {
          $scope.errorMessage = "Failed to get friends list.";
        });
    } else {
      $scope.errorMessage = loginId + " is an invalid Steam ID. Steam ID format: 7656119xxxxxxxxxx"
    }
  }

  /** Handles login button click. This is used when a user submits a Steam ID
   * rather than logging in using Open Auth. 
   */
  $scope.login = function () {
    validateAndLogin($scope.newLoginId);
  }

  /** Handles demo button click. */
  $scope.demo = function () {
    var demoId = loginService.getDemoId();
    validateAndLogin(demoId);
  }

}]);
