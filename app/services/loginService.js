app.factory('loginService', ['$http', '$q', 'locationService', function ($http, $q, locationService) {

  /** Base Steam API URL. */
  var steamApiBase = locationService.getSteamApiBase();

  /** Current user's login ID. */
  var loginId = "0";

  return {

    /** Gets the current user login ID. */
    getLoginId: function () {
      // If the login ID is already cached, then return it.
      if (loginId !== "0") {
        return $q.when(loginId);
      }
      // Otherwise go out to the server.
      var deferred = $q.defer();

      $http.get(steamApiBase + 'get_current_user').then((function (deferred) {
        return function (response) {
          var steamId = 0;

          if (response.hasOwnProperty('data') &&
            response.data.hasOwnProperty('steamId')) {
            steamId = response.data.steamId;
          }

          deferred.resolve(steamId);
        }
      })(deferred));

      return deferred.promise;
    },

    /** Sets the current user login ID. */
    setLoginId: function (loginId) {
      return $http.post(steamApiBase + 'set_current_user/' + loginId);
    },

    /** Gets the user ID used for the demo. */
    getDemoId: function () {
      var demoId = "76561197978115959";
      return demoId;
    }
  }

}]);
