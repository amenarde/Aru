var schemas = require("./schemas.js");
var dbName = "Status_DB";
function create(poster, content, receiver, callback) {
    // Create the status
    schemas.Statuses.create({content: content, username: poster, likes: 0}, function(err, status) {
        if (err) {
            console.log(dbName + ") " + err);
            callback(null, err);
        } else {
            // Add the status to a wall
            schemas.Wall.create({sID: status.get("sID"), username: receiver}, function(err2, wall) {
                if (err2) {
                    // Repeal the status
                    schemas.Statuses.delete(status.get("sID"), function(err3, status) {
                        if (err3) {
                            console.log(dbName + ") " + err2 + "\n" + err3);
                            callback(null, err2 + "\n" + err3);
                        } else {
                            console.log(dbName + ") " + err2);
                            callback(null, err2);
                        }
                    });
                } else {
                    console.log(dbName + ") created status " + status.get("sID"));
                    callback(status.get("sID"), null);
                }
            });
        }
    });
}

function deleteStatus(sID, username, callback) {
    // Remove the status from wall
    schemas.Wall.delete({username: username, sID: sID}, function(err, wall) {
        if (err) {
            console.log(dbName + ") " + err);
            callback(null, err);
        } else {
            // Remove status
            schemas.Statuses.delete(sID, function(err, status) {
                if (err) {
                    console.log(dbName + ") " + err);
                    callback(null, err);
                } else {
                    console.log(dbName + ") deleted status " + sID);
                    callback(true, null);
                }
            });
        }
    });
}

function addComment(sID, username, comment, callback) {
    schemas.StatusComments.create({sID: sID, username: username, data: comment, likes: 0}, function(err, status) {
        if (err) {
            console.log(dbName + ") " + err);
            callback(null, err);
        } else {
            console.log(dbName + ") added comment to " + sID);
            callback(true, null);
        }
        
    });
}

function fetch(sID, callback) {
    schemas.Statuses.get(sID, function(err, status) {
        console.log(dbName + ") getting " + sID);
        callback(status, err);
    })
}

function updateStatusContent(sID, content, callback) {
    schemas.Statuses.update({sID: sID, content: content}, function(err, status) {
        if (err) {
            console.log(dbName + ") update status content " + err);
            callback(null, err);
        } else {
            console.log(dbName + ") update status content");
            callback(true, null);
        }
    });
}

function updateStatusLikes(sID, numLikes, callback) {
    schemas.Statuses.update({sID: sID, likes: numLikes}, function(err, status) {
        if (err) {
            console.log(dbName + ") update status likes " + err);
            callback(null, err);
        } else {
            console.log(dbName + ") update status likes ");
            callback(true, null);
        }
    });
}

function updateStatusCommentContent(sID, poster, content, callback) {
    schemas.StatusComments.update({sID: sID, username: poster, content: content}, function(err, status) {
        if (err) {
            console.log(dbName + ") update comment content " + err);
            callback(null, err);
        } else {
            console.log(dbName + ") update comment content ");
            callback(true, null);
        }
    });
}

function updateStatusCommentLikes(sID, poster, numLikes, callback) {
    schemas.StatusComments.update({sID: sID, username: poster, likes: numLikes}, function(err, status) {
        if (err) {
            console.log(dbName + ") update comment likes " + err);
            callback(null, err);
        } else {
            console.log(dbName + ") update comment likes " + err);
            callback(true, null);
        }
    });
}

var database = {
    create: create,
    addComment: addComment,
    delete: deleteStatus,
    get: fetch,
    updateStatusLikes: updateStatusLikes,
    updateStatusContent: updateStatusContent,
    updateStatusCommentLikes: updateStatusCommentLikes,
    updateStatusCommentContent: updateStatusCommentContent,
}
module.exports = database;