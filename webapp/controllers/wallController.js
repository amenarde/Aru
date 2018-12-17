var PostDB = require('../models/postsDB.js');
var FriendshipDB = require("../models/friendsDB.js");
var db = require('../models/userDB.js');
var Heap = require('heap');

// Functions for Posts
function newStatusUpdate(req, res) {
    createPost(req.session.account, req.body.statusUpdate, "statusUpdate", req.session.account, function(success, err) {
        if (err) {
          res.send({error: err});
        } else {
            if (err) {
                console.log("Err");
                res.redirect('back');
            } else {
                res.redirect('back');
                // PostDB.updatepostsLikes(success.attrs.pID, req.session.account, function(result, err) {
                //     if (err) {
                //         res.redirect('back');
                //     } else {
                //         res.redirect('back');
                //     }
                // });
            }
        }
    });
}
function newFriendPost(req, res) {
    // Make sure friends with person
    let poster = req.session.account;
    let receiver = req.body.receiver.slice(0, -1);
    FriendshipDB.checkFriendship(poster, receiver, function(result, err) {
        if (err) {
            res.send(null, err);
        } else {
            if (result) {
                console.log("post created");
                // Create the Post
                createPost(req.session.account, req.body.content, "friendPost", receiver, function(success, err) {
                    if (err) {
                        console.log("Err: " + err);
                        res.redirect('back');
                    } else {
                        res.redirect('back');
                        // PostDB.updatepostsLikes(success.attrs.pID, poster, function(result, err) {
                        //     if (err) {
                        //         res.redirect('back');
                        //     } else {
                        //         res.redirect('back');
                        //     }
                        // });
                    }
                });
            } else {
                res.send({error: null, post: "You can't post to non-friends walls. Please don't hack our program :("});
            }
        }
    });
}

function createPost(poster, content, type, receiver, callback) {
    // Make sure user is online
    if (!poster) { callback(null, "Something went wrong. Please log in again."); return;}
    if (!content) { callback(null, "No post data recieved!"); return;}
    if (!receiver) { callback(null, "No receiver provided!"); return;}
    if (!type) { callback(null, "No type provided!"); return;}
    PostDB.createposts(poster, content, type, receiver, callback);
}

// Needs sID, wall
function deletePost(req, res) {
    // Make sure person deleting has permisions (so make sure they made the post)
    let username = req.session.account;
    if (!username) {res.render('main.ejs', {error: "You must be logged in to perform that action."});}
    let sID = req.body.sID;

    // Remove the Post
    PostDB.delete(sID, wall, callback);
}

// Needs sID, poster, comment,
function addComment(req, res) {
    let username = req.session.account;
    if (!username) {res.render('main.ejs', {error: "You must be logged in to perform that action."});}
    let content = req.body.content;
    let pID = req.body.pID.slice(0, -1);
    console.log("content is: " + content);
    // Make sure user is friends with the poster?
    PostDB.addComment(pID, username, content, function(comment, err) {
        res.redirect('back');
    });
}

// Needs sID, username
function likePost(req, res) {
    let username = req.account.session;
    if (!username) {res.render('main.ejs', {error: "You must be logged in to perform that action."});}

    // Make sure user hasn't liked this comment before

}

// Needs sID, username
function unlikePost(req, res) {

}

// Needs sID, username, newContent
function editPost(req, res) {
    // Make sure the user can edit the Post
}

// Needs sID, username, newContent
function editComment(req, res) {
    // Make sure user can edit the comment
}

// Tested - works
function getAccountInformation(req, res) {
  let username = req.params.username;
  db.get(username, function(user, err) {
    if (err) {
      res.send({error: err});
    } else {
      // Remove password from the object
      console.log("Got user");
      console.log(user);
      if (user) {
        let userData = {
            username: user.attrs.username,
            firstName: user.attrs.firstName,
            lastName: user.attrs.lastName,
            affiliation: user.attrs.affiliation,
            birthday: user.attrs.birthday,
          }
          let timestamp = req.body.timestamp;
          FriendshipDB.checkFriendship(req.session.account, username, function(status, err) {
            if (err) {
                res.send({error: err});
            } else {
                console.log("STATUS IS: " + status);
                if (status === "confirmed" || username === req.session.account) {
                    getWallContent(username, timestamp, function(feed, err) {
                        if (err) {
                            res.send({error: err});
                        } else {
                            console.log("feed is: " + JSON.stringify(feed));
                            constructFeedFromIDs(feed, function(wallContent, err) {
                                if (err) {
                                    res.send({error: err});
                                } else {
                                    db.fetchInterests(username, function(interests, err) {
                                        if (err) {
                                            res.send({error: err});
                                        } else {
                                            res.render('wall.ejs', {error: err, user: req.session.account, userData : userData, interests: interests, wallContent: wallContent, status: "confirmed"});
                                        }
                                    })

                                }
                            });
                        }
                      });
                } else {
                    console.log("not friends!!");
                    res.render('wall.ejs', {error: err, user: req.session.account, userData : userData, wallContent: {}, status: status})
                }
            }
          })
      } else {
          res.send({error: "No user found for " + username});
      }

    }
  })
}

// Get info to display to a user
function getWallContent(username, timestamp, callback) {
    if (!username) {
        res.send({error: "Something went wrong. Please log in again!"});
    } else {
        // Get friends of user (async!)
        constructFromTime(username, timestamp, function(feed, err) {
            callback(feed, null)
        });
    }
}

let PAGE_SIZE = 10;
// Build the newsfeed from a certain index
function constructFromTime(username, timestamp, callback) {
    // Put all values in heap
    let postsHeap = new Heap(function(a, b) {
        // Custom comparator for entires
        if (new Date(a.createdAt) > new Date(b.createdAt)) {
            return -1
        } else if (new Date(a.createdAt) === new Date(b.createdAt)) {
            return 0
        } else {
            return 1;
        }
    });
    // Get entries for each friend
    let returned = 0;
    // Posts - only statuses coming after some timestamp
    PostDB.getXFromTime(username, timestamp, PAGE_SIZE, function(posts, err) {
        if (err) {
            // Fail gracefully?
            callback(null, err);
        } else {
            // Aggregate values
            console.log(posts);
            for (let j = 0; j < posts.length; j++) {
                postsHeap.push(posts[j]);
            }
            constructFeedFromHeap(postsHeap, callback);
        }

    });
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

function constructFeedFromIDs(feedIDs, callback) {
    // Pull ID out of object
    postData = [];
    for (let i = 0; i < feedIDs.length; i++) {
        if (feedIDs[i] != null) {
            postData.push({pID: feedIDs[i].pID, receiver: feedIDs[i].username, index: i});
        }
    }

    console.log("postData is: " + postData);
    // Find the posts, comments and return them
    PostDB.getPosts(postData, function(feed, error) {
        callback(feed, error);
    });
}

var controller = {
    openProfile: getAccountInformation,
    editComment: editComment,
    editPost: editPost,
    likePost: likePost,
    unlikePost: unlikePost,
    addComment: addComment,
    deletePost: deletePost,
    newStatusUpdate: newStatusUpdate,
    newFriendPost: newFriendPost,
}
module.exports = controller;

