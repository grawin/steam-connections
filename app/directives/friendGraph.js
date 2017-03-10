app.directive('friendGraph', function () {

  function link(scope, element, attrs) {
    scope.$watch('graphSteamId', function () {
      var el = element[0];

      // TODO - size, could use el.clientWidth el.clientHeight
      var width = 960,
        height = 600,
        // TODO - styling
        nodeFill = '#ccc',
        nodeRadius = 10;

      var svg = d3.select(el).select('svg')
        .attr('width', width)
        .attr('height', height);

      // Delete anything that already exists in the svg.
      svg.selectAll("*").remove();

      // Create nodes
      var nodes = scope.nodes;

      // Create links
      var links = scope.links;

      // TODO - still need to tweak linkDistance, strength, charge, etc.
      var force = d3.layout.force()
        //.gravity(0.05)
        .charge(-300)
        .linkDistance(120)
        .size([width, height])
        .nodes(nodes)
        .links(links)
        .start();

      // Draw links
      var linkSelection = svg.selectAll('.link')
        .data(links)
        .enter()
        .append('line')
        .classed('link', true)
        .style('stroke', '#aaa');

      // Draw nodes
      var nodeSelection = svg.selectAll('.node')
        .data(nodes)
        .enter()
        .append('g')
        .classed('node', true)
        .call(force.drag);

      // Use a circle for now.
      nodeSelection.append('circle')
        .attr('r', nodeRadius)
        .attr('data-node-index', function (d, i) {
          return i;
        })
        .style('fill', nodeFill);

      // Display user names on nodes.
      nodeSelection.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function (d) {
          return d.name
        });

      // Use the "stock" tick functions.
      force.on("tick", function () {
        // Tick for links
        linkSelection.attr("x1", function (d) {
            return d.source.x;
          })
          .attr("y1", function (d) {
            return d.source.y;
          })
          .attr("x2", function (d) {
            return d.target.x;
          })
          .attr("y2", function (d) {
            return d.target.y;
          });
        // Tick for nodes
        nodeSelection.attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
      });
    });
  }

  return {
    link: link,
    restrict: 'E',
    scope: false,
    template: "<svg></svg>"
  }

})
