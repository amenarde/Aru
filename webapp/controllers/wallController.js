var PostDB = require("../models/postsDB.js");

/*
TODO
-----
AreFriends
*/

// Functions for Postes
function newPost(req, res) {
    createPost(req.session.username, req.body.post, req.session.receiver, function(success, err) {
        res.send({error: err});
    });
}
function createPost(poster, content, receiver, callback) {
    // Make sure user is online
    if (!username) { callback(null, "Something went wrong. Please log in again."); }
    // Make sure use is friends with the person (async)
    areFriends(poster, receiver, function(result, err) {
        if (err) {
            callback(null, err);
        } else {
            if (result) {
                // Create the Post
                PostDB.create(poster, content, receiver, callback);
            } else {
                callback(null, "You can't post to non-friends walls. Please don't hack our program :(");
            }
        }
    });
}

function deletePost(sID, wall, callback) {
    // Make sure person deleting has permisions (so make sure they made the post)

    // Remove the Post
    PostDB.delete(sID, wall, callback);
}

function addComment(sID, poster, comment, callback) {
    // Make sure user is friends with the poster?
}

function likePost(sID, username, callback) {
    // Make sure user hasn't liked this comment before
}

function unlikePost(sID, username, callback) {
    
}

function editPost(sID, username, newContent, callback) {
    // Make sure the user can edit the Post
}

function editComment(sID, username, newContent, callback) {
    // Make sure user can edit the comment
}

// Get info to display to a user
function getWallContent(req, res) {
    let username = req.session.account;
    if (!username) {
        res.send({error: "Something went wrong. Please log in again!"});
    } else {
        // Get friends of user (async!)
        constructFromTime(username, timestamp, function(feed, err) {
            res.render('wall.ejs', {error: err});
            res.send({feed: feed});
        });
    }
}

// Build the newsfeed from a certain index
function constructFromTime(username, timestamp, callback) {
    // Put all values in heap
    let postsHeap = new Heap(function(a, b) {
        // Custom comparator for entires
        if (new Date(a.get('createdAt')) > new Date(b.get('createdAt'))) {
            return 1
        } else {
            return 0
        }
    });
    // Get entries for each friend
    let returned = 0;
    // Get 10 entries for each friend for user (async!)
    for (let i = 0; i < friends.length; i++) {
        // Posts - only statuses coming after some timestamp
        PostsDB.getXFromTime(username, timestamp, PAGE_SIZE, function(res, err) {
            if (err) {
                // Fail gracefully?
            } else {
                // Aggregate values
                for (let j = 0; j < res.length; i++) {
                    postsHeap.push(res[i]);
                }
            }
            returned++;
            if (returned == friends.length) {
                // Evaluate results
                constructFeedFromHeap(postHeap, callback);
            }
        });
    }
}

// Uses content from heap to build a newsfeed for a user
function constructFeedFromHeap(postHeap, callback) {
    let feed = [];
    // Pull desired entries from the heap
    for (let i = 0; i < PAGE_SIZE; i++) {
        feed.push(postHeap.pop());
    }
    // Return list
    callback(feed, null);
}

var controller = {
    openProfile: getWallContent,
    editComment: editComment,
    editPost: editPost,
    likePost: likePost,
    unlikePost: unlikePost,
    addComment: addComment,
    deletePost: deletePost,
    createPost: newPost,
}
module.exports = controller;

