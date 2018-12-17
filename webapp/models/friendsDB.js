var schemas = require("./schemas.js");
var async = require('async');

// User 1 request accepted, user 2 get new friend
function acceptFriendRequest(user1, user2, callback) {
    // Should there be checks for if already friends?
    // Check to make sure aren't friends
    // Accept request
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
        console.log("Friend: " + friends);
        console.log("Err: " + err);
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
            console.log("Trying friendship between " + user1 + " and " + user2);
            if (err) {
                console.log("FriendshipDB) Failed to add friendship - " + err);
                callback(null, err);
            } else {
                console.log(friendship)
                schemas.Friendships.create({user1: user2, user2: user1, status: "incoming"},
                {overwrite: false},
                function(err, friendship2) {
                    console.log("Trying friendship between " + user2 + " and " + user1);
                    console.log(friendship2)
                    if (err) {
                        schemas.Friendships.destroy(user1, user2, function(err2) {
                            if (err2) {
                                console.log("FriendshipDB) Failed to delete failed friendship request");
                                callback(null, "Error issuing friend request. Database state compromised!");
                            } else {
                                callback(null, err);
                            }
                        })
                    } else {
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
    console.log("Querying for friends of: " + user);
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
        console.log("Rejecting friendship between " + user + " and " + user2);
        if (err) {
            console.log("FriendshipDB) " + err);
            callback(err);
        } else {
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
    console.log("Querying for recommended friends of: " + username);
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
