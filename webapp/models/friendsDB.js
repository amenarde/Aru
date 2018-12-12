var schemas = require("./schemas.js");

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
                            callback(friendship, null);
                        }
                    }
                );
                
            }
        }
        );
}

function checkFriends(user1, user2, callback) {
    schemas.Friendships.get(user1, user2, function(err, friends) {
        // Assuming returns null if not friends
        console.log("Friend: " + friends);
        console.log("Err: " + err);
        if (err) {
            console.log("FriendshipDB) Failed to check friends for " + user1 + " and " + user2 + ".");
            callback(null, err);
        } else {
            if (friends && friends.get("status") === "confirmed") {
                callback(true, null);
            } else {
                callback(false, null);
            }                
        }
    });
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
            if (friends) {
                callback(friends.get("status"), null);
            } else {
                callback(false, null);
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
                        callback(friendship, null);
                    }
                });
            }
        }
    );
}

function getFriends(user, callback) {
    schemas.Friendships.query(user)
    .where('status').equals('confirmed')
    .exec(callback);
}

function getPendingRequest(user, callback) {
    schemas.Friendships.query(user)
    .where('status').equals('pending')
    .exec(callback);
}

function getIncomingRequest(user, callback) {
    schemas.Friendships.query(user)
    .where('status').equals('incoming')
    .exec(callback);
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

var database = {
    friendRequest: issueFriendRequest,
    areFriends: checkFriends,
    getPending: getPendingRequest,
    getIncomingRequest: getIncomingRequest,
    rejectRequest: rejectFriendRequest,
    acceptRequest: acceptFriendRequest,
    getFriends: getFriends,
    removeFriend: deleteFriend,
    checkFriendship: checkFriendStatus,
}
module.exports = database;