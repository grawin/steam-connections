app.factory('forceGraphService', [function () {

  function getNodes(steamId, userData) {
    var nodes = [],
      i,
      friendList = userData[steamId].friends;

    for (i = 0; i < friendList.length; i++) {
      var currentId = friendList[i].steamid;

      if (userData.hasOwnProperty(currentId) &&
        userData[currentId].hasOwnProperty('summary')) {
        nodes.push({
          id: currentId,
          name: userData[currentId].summary.personaname
        });
      }
    }

    return nodes;
  }

  function getLinks(nodes, userData) {
    var links = [];

    try {

      // For each user
      nodes.forEach(function (srcUser, srcIdx, srcList) {
        // For each remaining user
        for (var tgtIdx = srcIdx + 1; tgtIdx < srcList.length; tgtIdx++) {
          // If remaining user is in friend list, then add as connection.
          var targetId = nodes[tgtIdx].id;
          if (!(userData.hasOwnProperty(targetId)) ||
            !userData[targetId].hasOwnProperty('friends')) {
            // ID not found in user list or friends list is private
            continue;
          }
          var targetUser = userData[targetId];
          if (targetUser.friends.some(function (targetFriend) {
              return targetFriend.steamid === srcUser.id;
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
    } catch (e) {
      console.log(e);
    }

    return links;
  }

  return {
    getGraphData: function (steamId, userData) {
      var graphData = {};
      graphData.nodes = getNodes(steamId, userData);
      graphData.links = getLinks(graphData.nodes, userData);
      return graphData;
    }
  }

}]);
