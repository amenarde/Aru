var PostDB = require("../models/postsDB.js");

// Functions for Postes
function createPost(poster, content, receiver, callback) {
    // Make sure user is online

    // Make sure use is friends with the person

    // Create the Post
    PostDB.create(poster, content, receiver, callback);
}

function deletePost(sID, wall, callback) {
    // Make sure person deleting has permisions

    // Remove the Post
    PostDB.delete(sID, wall, callback);
}

function addComment(sID, poster, comment, callback) {
    // Make sure user is friends with the poster?
}

function updatePostLikes(sID, newLikes, callback) {
    // Make sure user hasn't liked this comment before
}

function editPost(sID, username, newContent, callback) {
    // Make sure the user can edit the Post
}

function editComment(sID, username, newContent, callback) {
    // Make sure user can edit the comment
}

// Get info to display to a user
var getWallContent = function(req, res) {
    console.log(req.params);
    res.render('wall.ejs', {error: ""});
}

var routes = {
    openProfile: getWallContent,
}

module.exports = routes;
