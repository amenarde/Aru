var schemas = require("./schemas.js");
var dbName = "posts_DB";
var async = require('async');

function create(poster, content, type, receiver, callback) {
    // Create the posts
    console.log("Creating new entry in database with " + poster + " - " + content + " - type:" + type + " - " + receiver );
    schemas.Posts.create({content: content, username: poster, likes: 0, type: type}, function(err, posts) {
        if (err) {
            console.log(dbName + ") " + err);
            callback(null, err);
        } else {
            console.log("Type: " + posts.get("type"));
            // Add the posts to a wall
            schemas.Wall.create({pID: posts.get("pID"), username: receiver, createdAt: posts.get("createdAt")}, function(err2, wall) {
                if (err2) {
                    // Repeal the posts
                    schemas.Posts.delete(posts.get("pID"), function(err3, posts) {
                        if (err3) {
                            console.log(dbName + ") " + err2 + "\n" + err3);
                            callback(null, err2 + "\n" + err3);
                        } else {
                            console.log(dbName + ") " + err2);
                            callback(null, err2);
                        }
                    });
                } else {
                    console.log(dbName + ") created posts " + posts.get("pID"));
                    callback(posts, null);
                }
            });
        }
    });
}

function deleteposts(timestamp, username, callback) {
    // Remove the posts from wall
    schemas.Wall.delete({username: username, createdAt: timestamp}, function(err, wall) {
        if (err) {
            console.log(dbName + ") " + err);
            callback(null, err);
        } else {
            // Remove posts
            schemas.Posts.delete(wall.get('pID'), function(err, posts) {
                if (err) {
                    console.log(dbName + ") " + err);
                    callback(null, err);
                } else {
                    console.log(dbName + ") deleted posts " + posts.get('pID'));
                    callback(true, null);
                }
            });
        }
    });
}

function addComment(pID, username, comment, callback) {
    schemas.postsComments.create({pID: pID, username: username, data: comment, likes: 0}, function(err, posts) {
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
    schemas.Posts.get(pID, function(err, posts) {
        console.log(dbName + ") getting " + pID);
        callback(posts, err);
    })
}

function getPosts(postData, callback) {
    var postList = [];
    console.log("Post data: ");
    console.log(postData);
    async.each(postData, function(data, completed) {
        // Request the data
        console.log("Asked to fetch");
        console.log(data);
        fetch(data.pID, function(post, err) {
            if (err) {
                completed(err);
            } else {
                post.attrs.receiver = data.receiver;
                postList.push(post.attrs);
                completed(null);
            }
        });
    }, function (err) {
        console.log("Returning posts");
        console.log(postList);
        callback(postList, null);
    });
}

function collectPostData(posts, callback) {
    var postList = [];
    // This isn't async?
    async.each(posts.Items, function(post, completed) {
        postList.push(post.attrs);
        completed(null); 
    }, function (err) {
        console.log("Returning collected posts");
        console.log(postList);
        callback(postList, null);
    });
}

function fetchFromTimeFromUser(username, timestamp, X, callback) {
    if (timestamp) {
        if (X >= 0) {
            schemas.Wall.query(username)
            .descending()
            .where('createdAt').lt(timestamp)
            .limit(X)
            .loadAll()
            .exec(function(err, posts) {
                if (err) {
                    callback(null, err);
                } else {
                    collectPostData(posts, callback);
                }
            });
        } else {
            schemas.Wall.query(username)
            .descending()
            .where('createdAt').lt(timestamp)
            .loadAll()
            .exec(function(err, posts) {
                if (err) {
                    callback(null, err);
                } else {
                    collectPostData(posts, callback);
                }
            });
        }
    } else {
        if (X >= 0) {
            schemas.Wall.query(username)
            .descending()
            .limit(X)
            .loadAll()
            .exec(function(err, posts) {
                if (err) {
                    callback(null, err);
                } else {
                    collectPostData(posts, callback);
                }
            });
        } else {
            schemas.Wall.query(username)
            .descending()
            .loadAll()
            .exec(function(err, posts) {
                if (err) {
                    callback(null, err);
                } else {
                    collectPostData(posts, callback);
                }
            });
        }
    }
    
}

function fetchSinceTimeFromUser(username, timestamp, X, callback) {
    if (X >= 0) {
        schemas.Wall.query(username)
        .descending()
        .where('createdAt').gt(timestamp)
        .limit(X)
        .exec(function(err, posts) {
            if (err) {
                callback(null, err);
            } else {
                collectPostData(posts, callback);
            }
        });
    } else {
        schemas.Wall.query(username)
        .descending()
        .where('createdAt').gt(timestamp)
        .exec(function(err, posts) {
            if (err) {
                callback(null, err);
            } else {
                collectPostData(posts, callback);
            }
        });
    }
}

function updatepostsContent(pID, content, callback) {
    schemas.Posts.update({pID: pID, content: content}, function(err, posts) {
        if (err) {
            console.log(dbName + ") update posts content " + err);
            callback(null, err);
        } else {
            console.log(dbName + ") update posts content");
            callback(true, null);
        }
    });
}

function updatepostsLikes(pID, numLikes, callback) {
    schemas.Posts.update({pID: pID, likes: numLikes}, function(err, posts) {
        if (err) {
            console.log(dbName + ") update posts likes " + err);
            callback(null, err);
        } else {
            console.log(dbName + ") update posts likes ");
            callback(true, null);
        }
    });
}

function updatepostsCommentContent(pID, poster, content, callback) {
    schemas.postsComments.update({pID: pID, username: poster, content: content}, function(err, posts) {
        if (err) {
            console.log(dbName + ") update comment content " + err);
            callback(null, err);
        } else {
            console.log(dbName + ") update comment content ");
            callback(true, null);
        }
    });
}

function updatepostsCommentLikes(pID, poster, numLikes, callback) {
    schemas.postsComments.update({pID: pID, username: poster, likes: numLikes}, function(err, posts) {
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
    createposts: create,
    addComment: addComment,
    delete: deleteposts,
    get: fetch,
    getPosts: getPosts,
    getXFromTime: fetchFromTimeFromUser,
    getXSinceTime: fetchSinceTimeFromUser,
    updatepostsLikes: updatepostsLikes,
    updatepostsContent: updatepostsContent,
    updatepostsCommentLikes: updatepostsCommentLikes,
    updatepostsCommentContent: updatepostsCommentContent,
}
module.exports = database;