var schemas = require("./schemas.js");

function create(poster, content, receiver, callback) {
    // Create the status
    schemas.Statuses.create({}, function(err, status) {

    });
}

function deleteStatus(sID, callback) {

}

function addComment(sID, comment, callback) {

}

function fetch(sID, callback) {

}

var database = {
    create: create,
    addComment: addComment,
    delete: deleteStatus,
    get: fetch,
}
module.exports = database;