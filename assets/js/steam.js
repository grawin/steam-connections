/** Performs common setup. */
var initSetup = (function () {
  // TODO - should probably limit this to an ID or class
  // Disable spinner on number input
  $(':input[type=number]').on('mousewheel', function (e) {
    e.preventDefault();
  });

})();

/** Module for collecting data from the Steam API. */
var steamData = (function () {
  /** Steam ID that initiated the data gathering. */
  var primarySteamId = "";
  /** Maps Steam ID to a friend list (an array of Steam IDs). */
  var userMap = {};
  /** Maps Steam ID to a user summary data object. */
  var userData = {};

  /** Calls steam API to get friends for provided user ID. */
  function getFriends(steamId) {
    return $.ajax({
      type: "GET",
      dataType: "json",
      url: "/steamapi/friends/" + steamId,
      steamId: steamId,
      success: getFriendsSuccess,
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.log("Status: " + textStatus + " Error: " + errorThrown);
      }
    });
  }

  /** Success function for getFriends.
   * If the user's profile is "private" then the friend list will be empty.
   */
  function getFriendsSuccess(data, textStatus, jqXHR) {
    // Check for expected JSON properties
    if (!(data.hasOwnProperty('friendslist')) ||
      !(data.friendslist.hasOwnProperty('friends'))) {
      return;
    }
    // Build list of friend IDs
    var friendIdList = [];
    var friends = data.friendslist.friends;
    for (var i = 0; i < friends.length; i++) {
      friendIdList.push(friends[i].steamid);
    }
    // Update user map
    userMap[this.steamId] = friendIdList;
  }

  /** Calls steam API to get summary info for provided user ID. */
  function getSummary(steamId) {
    return $.ajax({
      type: "GET",
      dataType: "json",
      url: "/steamapi/summary/" + steamId,
      steamId: steamId,
      success: function (data) {
        // Check for expected JSON properties
        if (!(data.hasOwnProperty('response')) ||
          !(data.response.hasOwnProperty('players'))) {
          console.log("Invalid player summary for: " + this.steamId);
          return;
        }
        // Store meat of response in userData
        var playerData = data.response.players[0];
        userData[this.steamId] = playerData;
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.log("Status: " + textStatus + " Error: " + errorThrown);
      }
    });
  }

  /** Validates the provided Steam ID string.
   * Steam ID format: 7656119xxxxxxxxxx
   * @param {string} steamId - The Steam ID.
   */
  function isSteamIdValid(steamId) {
    var re = /^7656119\d{10}/;
    return ((typeof steamId === "string") &&
      re.exec(steamId));
  }

  /**
   * Main entry point. Initiates collection of user data from Steam API.
   * @param {string} steamId - The primary steam ID (the user who is searching).
   */
  function buildFriends(steamId) {
    if (isSteamIdValid(steamId)) {
      // Save off ID of user who initiated the search.
      primarySteamId = steamId;

      // Get friends of the primary user then gather data on friends.
      getFriends(steamId).then(function () {
        buildFriendsOfFriends();
      });
    }
  }

  /** Gathers data on friend's fiend lists then initiates collection of
   * summary data for friends.
   */
  function buildFriendsOfFriends() {
    // Request friends for each friend of the primary user.
    var reqArray = [];
    $.each(userMap[primarySteamId], function (i, friend) {
      //console.log("getFriends for: " + friend);
      reqArray.push(getFriends(friend));
    });

    $.when.apply($, reqArray).done(function () {
      // All friend list requests are complete now collect user data.
      buildUserData();
    });
  }

  /** Gathers summary data for each unique user. */
  function buildUserData() {
    var reqArray = [],
      i,
      friendList = userMap[primarySteamId];

    // Get data for primary user.
    reqArray.push(getSummary(primarySteamId));

    // Get summary for each friend of primary user.
    for (i = 0; i < friendList.length; i++) {
      reqArray.push(getSummary(friendList[i]));
    }
    // Done collecting data, can now build graph.
    $.when.apply($, reqArray).done(function () {
      steamGraph.buildGraph(userMap, userData, primarySteamId);
    });
  }

  // Public interface
  return {
    buildFriends: buildFriends
  };

})();


/** Steam graphing module using a D3.js force directed graph.
 * The graph will display the network of contacts of the provided
 * Steam ID account.
 */
var steamGraph = (function () {

  /** Builds the data for displaying the force directed graph. */
  function buildGraph(userMap, userData, primaryUserId) {

    // TODO - size
    var width = 960,
      height = 600;
    // TODO - styling
    var nodeFill = '#ccc';
    var nodeRadius = 10;

    // TODO - should use ID for container...
    var svg = d3.select('.container-fluid').append('svg')
      .attr('width', width)
      .attr('height', height);

    // Create nodes
    // Convert user map to a list for ease of use in building graph data.
    var userList = [];
    $.each(userMap, function (userId, friendList) {
      // If data exists for this user.
      // TODO - for now don't add the primary user as a node
      // this clutters the graph... a lot
      if (userData.hasOwnProperty(userId) &&
        (userId != primaryUserId)) {
        // Add them to the node list.
        var currentUser = userData[userId];
        userList.push({
          id: userId,
          name: userData[userId].personaname,
          friends: friendList
        });
      }
    });

    // Create links
    var links = [];
    // For each user
    userList.forEach(function (srcUser, srcIdx, srcList) {
      // For each remaining user
      for (var tgtIdx = srcIdx + 1; tgtIdx < srcList.length; tgtIdx++) {
        // If remaining user is in friend list, then add as connection.
        var targetUser = userList[tgtIdx];
        if (targetUser.friends.some(function (targetFriend) {
            return targetFriend === srcUser.id;
          })) {
          // Match found
          links.push({
            source: srcIdx,
            target: tgtIdx,
            link: srcUser.id
          });
        }
      }
    });

    // TODO - still need to tweak linkDistance, strength, charge, etc.
    var force = d3.layout.force()
      //.gravity(0.05)
      .charge(-300)
      .linkDistance(120)
      .size([width, height])
      .nodes(userList)
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
      .data(userList)
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
  }

  // Public interface
  return {
    buildGraph: buildGraph
  }

})();
