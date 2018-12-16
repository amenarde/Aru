var schemas = require("./schemas.js");
var dbName = "posts_DB";
var async = require('async');

function create(poster, content, type, receiver, callback) {
    // Create the posts
    schemas.Posts.create({content: content, username: poster, likes: 0, type: type}, function(err, posts) {
        if (err) {
            console.log(dbName + ") " + err);
            callback(null, err);
        } else {
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
    schemas.PostComments.create({pID: pID, username: username, content: comment, likes: 0}, function(err, posts) {
        if (err) {
            console.log(dbName + ") " + err);
            callback(null, err);
        } else {
            console.log(dbName + ") added comment to " + pID);
            callback(true, null);
        }
    });
}

function deleteComment(pID, createdAt, callback) {
    schemas.PostComments.destroy(pID, createdAt, function(err) {
        if (err) {
            console.log("PostCommentsDB) Failed to delete comment\n" + err);
        }
        callback(err);
    });
}

function getCommentsForPost(pID, callback) {
    var commentList = [];
    schemas.PostComments.query(pID)
    .descending().loadAll()
    .exec(function(err, comments) {
        if (err) {
            callback(null, err);
        } else {
            async.each(comments.Items, function(comment, completed) {
                commentList.push(comment.attrs);
                completed(null);
            }, function (err) {
                callback(commentList, null);
            });
        }
    });
}

function fetch(pID, callback) {
    schemas.Posts.get(pID, function(err, posts) {
        console.log(dbName + ") getting " + pID);
        callback(posts, err);
    })
}

// Returns a post and its comments
function getPosts(postData, callback) {
    // Need to maintain order
    async.each(postData, function(data, completed) {
        // Request the data
        fetch(data.pID, function(post, err) {
            if (err) {
                completed(err);
            } else {
                // Need to place in appropiate place (update at corresponding index)
                postData[data.index].content = post.attrs.content;
                postData[data.index].type = post.attrs.type;
                postData[data.index].likes = post.attrs.likes;
                postData[data.index].createdAt = post.attrs.createdAt
                postData[data.index].username = post.attrs.username;
                // Now get comments for the post
                getCommentsForPost(data.pID, function(comments, err) {
                    if (err) {
                        completed(err);
                    }  else {
                        postData[data.index].comments = comments;
                        completed(null);
                    }
                });
            }
        });
    }, function (err) {
        callback(postData, null);
    });
}

// Aggregates the items into list of just attributes
function collectPostData(posts, callback) {
    var postList = [];
    // This isn't async?
    async.each(posts.Items, function(post, completed) {
        postList.push(post.attrs);
        completed(null);
    }, function (err) {
        callback(postList, null);
    });
}

function fetchFromTimeFromUser(username, timestamp, X, callback) {
    if (timestamp) {
        if (X >= 0) {
            schemas.Wall.query(username)
            .where('createdAt').lt(timestamp)
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
            .where('createdAt').lt(timestamp)
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
    } else {
        if (X >= 0) {
            schemas.Wall.query(username)
            .limit(X)
            .descending()
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
        .where('createdAt').gt(timestamp)
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
        .where('createdAt').gt(timestamp)
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

function updatepostsLikes(pID, username, callback) {
    schemas.PostLikes.create({pID: pID, username: username}, {overwrite: false}, function(err, post) {
        if (err) {
            console.log("PostLikes) update posts likes " + err);
            callback(null, err);
        } else {
            console.log("PostLikes) update posts likes");
            schemas.Posts.get(pID, function(err, post) {
                if (err) {
                    callback(null, err);
                } else {
                    schemas.Posts.update({pID: pID, likes: post.likes + 1}, function(err, posts) {
                        if (err) {
                            console.log(dbName + ") update posts likes " + err);
                            callback(null, err);
                        } else {
                            console.log(dbName + ") update posts likes ");
                            callback(true, null);
                        }
                    });
                }
            });
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
