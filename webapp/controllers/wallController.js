var StatusDB = require("../models/statusDB.js");

// Functions for statuses
function createStatus(poster, content, receiver, callback) {
    // Make sure user is online

    // Make sure use is friends with the person

    // Create the status
    StatusDB.create(poster, content, receiver, callback);
}

function deleteStatus(sID, wall, callback) {
    // Make sure person deleting has permisions

    // Remove the status
    StatusDB.delete(sID, wall, callback);
}

function addComment(sID, poster, comment, callback) {
    // Make sure user is friends with the poster?
}

function updateStatusLikes(sID, newLikes, callback) {
    // Make sure user hasn't liked this comment before
}

function editStatus(sID, username, newContent, callback) {
    // Make sure the user can edit the status
}

function editComment(sID, username, newContent, callback) {
    // Make sure user can edit the comment
}

// Get info to display to a user
function getWallContent() {

}