var schemas = require("./schemas.js");

// User 1 request accepted, user 2 get new friend
function acceptFriendRequest(user1, user2, callback) {
    // Should there be checks for if already friends?
    // Check to make sure aren't friends
    checkFriends(user1, user2, function(valid, err) {
        if (err) {
            callback(null, err);
        } else if (valid) {
            // Accept request
            schemas.Friendships.update({user1: user2, user2: user1, status: "confirmed"}, 
                function(errUpdate, _) {
                    if (errUpdate) {
                        console.log("FriendshipDB) Failed to add friendship for " + user1 + " and " + user2 + "- " + errUpdate);
                        callback(null, errUpdate);
                    } else {
                        schemas.Friendships.create({user1: user1, user2: user2, status: 'confirmed'}, 
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
        } else {
            callback(null, "Already friends!");
        }
    });
    
}

function checkFriends(user1, user2, callback) {
    schemas.Friendships.get(user1, user2, function(err, friends) {
        // Assuming returns null if not friends
        if (err) {
            console.log("FriendshipDB) Failed to check friends for " + user1 + " and " + user2 + ".");
            callback(null, err);
        } else {
            if (friends.get("status") === "confirmed") {
                callback(true, null);
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
            if (err) {
                console.log("FriendshipDB) Failed to add friendship - " + err);
                callback(null, err);
            } else {
                callback(friendship, null);
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

function rejectFriendRequest(user, user2, callback) {
    schemas.Friendships.destroy(user, user2, function(err) {
        callback(null, err);
    });
}

var database = {
    friendRequest: issueFriendRequest,
    checkFriends: checkFriends,
    getPending: getPendingRequest,
    rejectRequest: rejectFriendRequest,
    acceptRequest: acceptFriendRequest,
    getFriends: getFriends,
}
module.exports = database;