var schemas = require("./schemas.js");
var dbName = "Status_DB";

function create(poster, content, type, receiver, callback) {
    // Create the status
    schemas.Statuses.create({content: content, username: poster, likes: 0, type: type}, function(err, status) {
        if (err) {
            console.log(dbName + ") " + err);
            callback(null, err);
        } else {
            // Add the status to a wall
            schemas.Wall.create({pID: status.get("pID"), username: receiver, createdAt: status.get("createdAt")}, function(err2, wall) {
                if (err2) {
                    // Repeal the status
                    schemas.Statuses.delete(status.get("pID"), function(err3, status) {
                        if (err3) {
                            console.log(dbName + ") " + err2 + "\n" + err3);
                            callback(null, err2 + "\n" + err3);
                        } else {
                            console.log(dbName + ") " + err2);
                            callback(null, err2);
                        }
                    });
                } else {
                    console.log(dbName + ") created status " + status.get("pID"));
                    callback(status.get("pID"), null);
                }
            });
        }
    });
}

function deleteStatus(timestamp, username, callback) {
    // Remove the status from wall
    schemas.Wall.delete({username: username, createdAt: timestamp}, function(err, wall) {
        if (err) {
            console.log(dbName + ") " + err);
            callback(null, err);
        } else {
            // Remove status
            schemas.Statuses.delete(wall.get('pID'), function(err, status) {
                if (err) {
                    console.log(dbName + ") " + err);
                    callback(null, err);
                } else {
                    console.log(dbName + ") deleted status " + status.get('pID'));
                    callback(true, null);
                }
            });
        }
    });
}

function addComment(pID, username, comment, callback) {
    schemas.StatusComments.create({pID: pID, username: username, data: comment, likes: 0}, function(err, status) {
        if (err) {
            console.log(dbName + ") " + err);
            callback(null, err);
        } else {
            console.log(dbName + ") added comment to " + pID);
            callback(true, null);
        }
    });
}

function fetch(pID, callback) {
    schemas.Statuses.get(pID, function(err, status) {
        console.log(dbName + ") getting " + pID);
        callback(status, err);
    })
}

function fetchLastXFromUser(username, X, callback) {
    schemas.Wall.query(username)
        .ascending()
        .limit(X)
        .exec(function(err, statuses) {callback(statuses, err)})
}

function fetchSinceTimeFromUser(username, timestamp, callback) {
    schemas.Wall.query(username)
        .ascending()
        .where('timestamp').gt(timestamp)
        .exec(function(err, statuses) {callback(statuses, err)})
}

function updateStatusContent(pID, content, callback) {
    schemas.Statuses.update({pID: pID, content: content}, function(err, status) {
        if (err) {
            console.log(dbName + ") update status content " + err);
            callback(null, err);
        } else {
            console.log(dbName + ") update status content");
            callback(true, null);
        }
    });
}

function updateStatusLikes(pID, numLikes, callback) {
    schemas.Statuses.update({pID: pID, likes: numLikes}, function(err, status) {
        if (err) {
            console.log(dbName + ") update status likes " + err);
            callback(null, err);
        } else {
            console.log(dbName + ") update status likes ");
            callback(true, null);
        }
    });
}

function updateStatusCommentContent(pID, poster, content, callback) {
    schemas.StatusComments.update({pID: pID, username: poster, content: content}, function(err, status) {
        if (err) {
            console.log(dbName + ") update comment content " + err);
            callback(null, err);
        } else {
            console.log(dbName + ") update comment content ");
            callback(true, null);
        }
    });
}

function updateStatusCommentLikes(pID, poster, numLikes, callback) {
    schemas.StatusComments.update({pID: pID, username: poster, likes: numLikes}, function(err, status) {
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
    createStatus: create,
    addComment: addComment,
    delete: deleteStatus,
    get: fetch,
    getLastX: fetchLastXFromUser,
    getSinceTime: fetchSinceTimeFromUser,
    updateStatusLikes: updateStatusLikes,
    updateStatusContent: updateStatusContent,
    updateStatusCommentLikes: updateStatusCommentLikes,
    updateStatusCommentContent: updateStatusCommentContent,
}
module.exports = database;