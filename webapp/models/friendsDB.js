var schemas = require("./schemas.js");

function addFriendship(user1, user2, callback) {
    schemas.Friendships.create({user1: user1, user2: user2}, 
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

function issueFriendRequest(user1, user2, callback) {

}

function getFriends(user, callback) {
    schemas.Friendships.query(user).exec(function(err, friends) {callback(friends, err)});
}

function getFriendRequests(user, callback) {

}

function rejectFriendRequest(user, user2, callback) {

}

function acceptFriendRequest(user, user2, callback) {

}

var database = {
    confirmFriends: addFriendship,
    friendRequest: issueFriendRequest,
    getFriends: getFriends,
    getRequests: getFriendRequests,
    rejectRequest: rejectFriendRequest,
    acceptRequest: acceptFriendRequest,
}
module.exports = database;