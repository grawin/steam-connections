app.directive('loadingSpinner', function () {
  return {
    restrict: 'E',
    scope: false,
    template: "<div ng-show='isLoading' class='loading-container'>" +
      "<h3 class='loading-text' ng-bind='loadingText'></h3>" +
      "<div class='spinner'><img src=\"assets/svg/puff.svg\"></div>" +
      "</div>"
  };
});
