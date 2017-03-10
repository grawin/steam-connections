/** Service to collect user data for building connections.
 * Caches responses to HTTP requests to avoid re-requesting data.
 */
app.factory('userDataService', ['$http', '$q', 'locationService', function ($http, $q, locationService) {

  /** Steam API library path */
  var steamApiBase = locationService.getSteamApiBase();
  /** The cached user data. Indexed by Steam ID. */
  var userData = {};
  /** Factory object to return. Allows for calling methods defined within the object */
  var obj = {};

  /** Calls steam API to get summary info for provided user ID. */
  obj.getSummary = function (steamId, d) {

    // If the data exists in the cache then return a resolved promise.
    if ((steamId in userData) &&
      userData[steamId].hasOwnProperty('summary')) {
      return $q.when(userData[steamId].summary);
    } else {
      var deferred = (d === undefined) ? $q.defer() : d;

      var successCallback = function (steamId, deferred) {
        return function (result) {
          var summary;
          // If response has the expected summary data, return it.
          if (result.hasOwnProperty('data') &&
            result.data.hasOwnProperty('response') &&
            result.data.response.hasOwnProperty('players') &&
            result.data.response.players.length) {
            // Cache data and return.
            summary = result.data.response.players[0];

            if (!(steamId in userData)) {
              userData[steamId] = {};
            }
            userData[steamId].summary = summary;

          } else {
            summary = {};
          }

          deferred.resolve(summary);
        }
      }

      var errorCallback = function (steamId, deferred) {
        return function (xhr, textStatus, errorThrown) {
          if (xhr.status == 500) {
            // For internal server error, retry.
            // This is just a make-shift way to handle my cheap hosting.
            // Change this to do whatever you see fit.
            obj.getFriends(steamId, deferred);
          } else {
            // For all other errors return empty list.
            deferred.resolve([]);
          }
        }
      }

      $http.get(steamApiBase + 'summary/' + steamId).then(
        successCallback(steamId, deferred),
        errorCallback(steamId, deferred));

      return deferred.promise;
    }
  }

  /** Calls steam API to get friends for provided user ID. */
  obj.getFriends = function (steamId, d) {
    // If the data exists in the cache then return a resolved promise.
    if ((steamId in userData) &&
      userData[steamId].hasOwnProperty('friends')) {
      return $q.when(userData[steamId].friends);
    } else {
      // Otherwise do the HTTP GET and return the promise.
      var deferred = (d === undefined) ? $q.defer() : d;

      // Define callbacks for passing params including the deferred.
      // Could also use Immediately Invoked Function Expression (IIFE) instead.
      var successCallback = function (steamId, deferred) {
        return function (result) {
          var friendList = [];

          if (result.hasOwnProperty('data') &&
            result.data.hasOwnProperty('friendslist') &&
            result.data.friendslist.hasOwnProperty('friends') &&
            result.data.friendslist.friends.length) {
            friendList = result.data.friendslist.friends;

            if (!(steamId in userData)) {
              userData[steamId] = {};
            }

            userData[steamId].friends = friendList;
          }

          deferred.resolve(friendList);
        }
      }

      var errorCallback = function (steamId, deferred) {
        return function (xhr, textStatus, errorThrown) {
          if (xhr.status == 500) {
            // For internal server error, retry.
            // This is just a make-shift way to handle my cheap hosting.
            // Change this to do whatever you see fit.
            obj.getFriends(steamId, deferred);
          } else {
            // For all other errors return empty list.
            deferred.resolve([]);
          }
        }
      }

      $http.get(steamApiBase + 'friends/' + steamId).then(
        successCallback(steamId, deferred),
        errorCallback(steamId, deferred));

      return deferred.promise;
    }
  }

  /** Gets connections for the provided user ID. */
  obj.getConnections = function (steamId) {

    var deferred = $q.defer();

    obj.getFriends(steamId).then((function (deferred) {
      return function (friendList) {
        var requests = [];

        // For each friend in desired user's friend list,
        // get friend's summary data and friend list.
        for (var i = 0; i < friendList.length; i++) {
          requests.push(obj.getFriends(friendList[i].steamid));
          requests.push(obj.getSummary(friendList[i].steamid));
        }

        $q.all(requests).then((function (deferred) {
          return function (data) {

            // Done collecting user data. Check for emtpy (private) friend lists
            // and populate with public friends.
            for (var userId in userData) {
              if (!(userData[userId].hasOwnProperty('friends'))) {
                userData[userId].friends = [];
                for (var searchId in userData) {
                  if (userData[searchId].hasOwnProperty('friends')) {
                    for (var i = 0; i < userData[searchId].friends.length; i++) {
                      var friendEntry = userData[searchId].friends[i];
                      if (friendEntry.steamid === userId) {
                        userData[userId].friends.push({
                          friend_since: friendEntry.friend_since,
                          relationship: friendEntry.relationship,
                          steamid: searchId
                        });
                        break;
                      }
                    }
                  }
                }
              }
            }

            deferred.resolve(userData);
          }
        })(deferred));

      }
    })(deferred));

    return deferred.promise;
  }

  return obj;

}]);
