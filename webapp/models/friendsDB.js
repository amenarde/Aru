var schemas = require("./schemas.js");
var async = require('async');

// Update statuses of user 1 and user 2
function acceptFriendRequest(user1, user2, callback) {
    schemas.Friendships.update({user1: user2, user2: user1, status: "confirmed"},
        function(errUpdate, _) {
            if (errUpdate) {
                console.log("FriendshipDB) Failed to add friendship for " + user1 + " and " + user2 + "- " + errUpdate);
                callback(null, errUpdate);
            } else {
                schemas.Friendships.update({user1: user1, user2: user2, status: 'confirmed'},
                    {overwrite: false},
                    function(errCreate, friendship) {
                        if (errCreate) {
                            // Repeal the previous friendship (how to deal with state)
                            schemas.Friendships.update({user1: user2, user2: user1, status: "pending"},
                                function(errRepeal, failedfriend) {
                                    if (errRepeal) {
                                        // Have a floating friendship
                                        callback(null, "Failed to add friend to " + user2 + "\n" + errCreate + "\n" + errRepeal);
                                    } else {
                                        callback(null, errCreate);
                                    }
                                }
                            );
                        } else {
                            // Remove the recommendation from the database
                            schemas.RecommendedFriends.destroy({user1: user1, user2: user2}, function(err) {
                                callback(friendship, null);
                            });
                        }
                    }
                );

            }
        }
        );
}

function checkFriendStatus(user1, user2, callback) {
    schemas.Friendships.get(user1, user2, function(err, friends) {
        // Assuming returns null if not friends
        if (err) {
            console.log("FriendshipDB) Failed to check status for " + user1 + " and " + user2 + ".");
            callback(null, err);
        } else {
            if (friends && friends.attrs.status === "confirmed") {
                callback("confirmed", null);
            } else if (friends && friends.attrs.status === "pending") {
                callback("pending", null);
            } else if (friends && friends.attrs.status === "incoming") {
                callback("incoming", null);
            } else {
                callback("notFriends", null);
            }
        }
    });
}

function issueFriendRequest(user1, user2, callback) {
    schemas.Friendships.create({user1: user1, user2: user2, status: "pending"},
        {overwrite: false},
        function(err, friendship) {
            if (err) {
                console.log("FriendshipDB) Failed to add friendship - " + err);
                callback(null, err);
            } else {
                schemas.Friendships.create({user1: user2, user2: user1, status: "incoming"},
                {overwrite: false},
                function(err, friendship2) {
                    if (err) {
                        // if failed, try to repeal the friendship just made
                        schemas.Friendships.destroy(user1, user2, function(err2) {
                            if (err2) {
                                console.log("FriendshipDB) Failed to delete failed friendship request");
                                callback(null, "Error issuing friend request. Database state compromised!");
                            } else {
                                callback(null, err);
                            }
                        })
                    } else {
                        // Remove recommendation from the database if it exists
                        schemas.RecommendedFriends.destroy({user1: user1, user2: user2}, function(err) {
                            callback(friendship, null);
                        });
                    }
                });
            }
        }
    );
}

function getFriends(user, callback) {
    // Get all friends who have confirmed status
    schemas.Friendships.query(user).usingIndex('StatusIndex')
    .where('status').equals('confirmed').loadAll()
    .exec(function(err, friends) {
        if (err) {
            callback(null, err);
        } else {
            var friendNames = [];
            async.each(friends.Items, function(friend, completed) {
                friendNames.push(friend.attrs.user2);
                completed(null);
            }, function (err) {
                callback(friendNames, null);
            });
        }
    });
}

function getPendingRequest(user, callback) {
    schemas.Friendships.query(user).usingIndex('StatusIndex')
    .where('status').equals('pending').loadAll()
    .exec(function(err, friends) {
        if (err) {
            callback(null, err);
        } else {
            var friendNames = [];
            async.each(friends.Items, function(friend, completed) {
                friendNames.push(friend.attrs.user2);
                completed(null);
            }, function (err) {
                callback(friendNames, null);
            });
        }
    });
}

function getIncomingRequest(user, callback) {
    schemas.Friendships.query(user).usingIndex('StatusIndex')
    .where('status').equals('incoming').loadAll()
    .exec(function(err, friends) {
        if (err) {
            callback(null, err);
        } else {
            var friendNames = [];
            async.each(friends.Items, function(friend, completed) {
                friendNames.push(friend.attrs.user2);
                completed(null);
            }, function (err) {
                callback(friendNames, null);
            });
        }
    });
}

function rejectFriendRequest(user, user2, callback) {
    schemas.Friendships.destroy(user, user2, function(err) {
        if (err) {
            console.log("FriendshipDB) " + err);
            callback(err);
        } else {
            // Have to remove requests from both databases
            schemas.Friendships.destroy(user2, user, function(err2) {
                if (err2) {
                    console.log("Failed to destory entry for " + user2 + " on reject\n" + err2);
                    callback("Error rejecting friendship request, database state now incosistent");
                } else {
                    callback(null);
                }
            });
        }
    });
}

function deleteFriend(user1, user2, callback) {
    schemas.Friendships.destroy(user1, user2, function(err) {
        if (err) {
            callback(err);
        } else {
            schemas.Friendships.destroy(user2, user1, function(err2) {
                if (err2) {
                    callback("Failed to delete friend for " + user2 + "\n" + err2);
                } else {
                    callback();
                }
            })
        }
    });
}

function getRecommendedFriends(username, callback) {
    schemas.RecommendedFriends.query(username)
    .loadAll()
    .exec(function(err, recommended) {
        if (err) {
            callback(null, err);
        } else {
            var friendNames = [];
            async.each(recommended.Items, function(friend, completed) {
                friendNames.push({friend: friend.attrs.user2, strength: friend.attrs.strength});
                completed(null);
            }, function (err) {
                callback(friendNames, null);
            });
        }
    });
}

var database = {
    friendRequest: issueFriendRequest,
    getPending: getPendingRequest,
    getIncomingRequest: getIncomingRequest,
    rejectRequest: rejectFriendRequest,
    acceptRequest: acceptFriendRequest,
    getFriends: getFriends,
    removeFriend: deleteFriend,
    checkFriendship: checkFriendStatus,
    getRecommendedFriends: getRecommendedFriends,
}
module.exports = database;
