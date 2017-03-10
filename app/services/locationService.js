app.factory('locationService', ['$location', function ($location) {

  /** Current protocol. */
  var protocol = $location.protocol();

  /** The hostname. */
  var host = $location.host();

  /** Base application folder.
   * To avoid hard coding this could setup server rewrite rule for /base/ */
  var base = "/steam/";

  /** Base URL of the application. */
  var baseUrl = protocol + '://' + host + base;

  /** Base library URL. */
  var baseLibUrl = baseUrl + 'assets/libs/'

  /** Steam API library path */
  var steamApiUrl = baseLibUrl + 'steamweb/steamapi.php?url=';

  return {
    getBaseLibUrl: function () {
      return baseLibUrl;
    },
    getSteamApiBase: function () {
      return steamApiUrl;
    }
  }

}]);
