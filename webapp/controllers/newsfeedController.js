var Heap = require('heap');
var PostsDB = require('../models/postsDB.js');
var FriendshipDB = require('../models/friendsDB.js');

var open = function(req, res) {
  if (req.session.account) {
    res.render('newsfeed.ejs', {error: ""});
  }
  else {
    res.render('main.ejs', {error: "You must be logged in to see that page."})
  }
};

//used in initial News Feed population and older post loading
//e.g. give me most recent 0-10, give me most recent pageOffset + updateOffset
var PAGE_SIZE = 10;
var getFeedFor = function(req, res) {
    // Get cached values of friends
    let username = req.session.account;
    username = "ptaggs";
    if (!username) {
        res.send({error: "Something went wrong. Please log in again!"});
    } else {
        // Get friends of user (async!)
        getFriends(username, function(friends, err) {
            console.log("Got friends: ");
            console.log(friends);
            if (err) {
              console.log("error");
                res.send({error: err});
            } else {
                let timestamp = req.body.timestamp; // TODO get index from req
                friends.push(username);
                // Build the newsfeed from a certain index
                // Only need one timestep, due to guarantees
                constructFromTime(friends, timestamp, function(feedIDs, err) {
                    // Convert ids into actual newsfeed with posts and comments
                    if (err) {
                        res.send({error: err});
                    } else {
                        console.log("Constructing feed from: ");
                        console.log(feedIDs);
                        constructFeedFromIDs(feedIDs, function(feed, err) {
                            res.send({feed: feed, error: err});
                        });
                    }
                });
            }
        });
    }
};

function constructFeedFromIDs(feedIDs, callback) {
    // Pull ID out of object
    postData = [];
    for (let i = 0; i < feedIDs.length; i++) {
        postData.push({pID: feedIDs[i].pID, receiver: feedIDs[i].username});
    }
    // Find the posts, comments and return them
    PostsDB.getPosts(postData, function(feed, error) {
        callback(feed, error);
    });
}

//used in periodic News Feed refresh
//e.g. give me posts since this timestamp
var getFeedSince = function(req, res) {
    let username = req.session.account;
    if (!username) {
        res.send({error: "Something went wrong. Please log in again!"});
    } else {
        getFriends(username, function(friends, err) {
            if (err) {
                res.send({error: err});
            } else {
                let timestamp = req.body.timestamp;
                constructFromRecent(timestamp, function(feed, err) {
                    res.send({feed: feed, error: err});
                });
            }
        });
    }
};

// Uses content from heap to build a newsfeed for a user
function constructFeedFromHeap(postHeap, callback) {
    let feed = [];
    // Pull desired entries from the heap
    for (let i = 0; i < PAGE_SIZE; i++) {
        if (postHeap.empty()) {
            break;
        }
        feed.push(postHeap.pop());
    }
    // Return list
    callback(feed, null);
}

// Build the newsfeed from a certain index
function constructFromTime(friends, timestamp, callback) {
    // Put all values in heap
    let postsHeap = new Heap(function(a, b) {
        // Custom comparator for entires
        if (new Date(a.createdAt) > new Date(b.createdAt)) {
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
        PostsDB.getXFromTime(friends[i], timestamp, PAGE_SIZE, function(posts, err) {
            if (err) {
                // Fail gracefully?
            } else {
                // Aggregate values
                for (let j = 0; j < posts.length; j++) {
                    postsHeap.push(posts[j]);
                }
            }
            returned++;
            if (returned == friends.length) {
                // Evaluate results
                constructFeedFromHeap(postsHeap, callback);
            }
        });
    }
}

function constructFromRecent(friends, timestamp, callback) {
    // Put all values in heap
    let postsHeap = new Heap(function(a, b) {
       // Custom comparator for entires
       if (new Date(a.createdAt) > new Date(b.createdAt)) {
           return 1
       } else {
           return 0
       }
   });
   // Get entries for each friend
   let returned = 0;
   // Get 10 entries for each friend for user (async!)
   for (let i = 0; i < friends.length; i++) {
       // Posts - get all posts after that happened since a time
       PostsDB.getXSinceTime(friends[i], timestamp, -1, function(posts, err) {
           if (err) {
               // Fail gracefully?
           } else {
               // Aggregate values
               for (let j = 0; j < posts.length; j++) {
                   postsHeap.push(posts[j]);
               }
           }
           returned++;
           if (returned == friends.length) {
               // Evaluate results
               constructFeedFromHeap(postsHeap, callback);
           }
       });
   }
}

function getFriends(username, callback) {
    // Get all my friends (async!)
    console.log("Getting friends for: " + username);
    FriendshipDB.getFriends(username, function(friends, err) {
        console.log("Friends: " + friends);
        console.log("Error: " + err);
        if (err) {
            callback(null, err);
        } else {
            callback(friends, null);
        }
    });
}

var postStatusUpdate = function(req, res) {
  console.log(req.body.statusUpdate);
  PostsDB.createposts(req.session.account, req.body.statusUpdate, req.session.account, "statusUpdate", function(data, err) {
    if (err) {
      res.send({error: err});
    } else {
      console.log("successfully updated");
    }
  });
}

var routes = {
  open: open,
  getFeedFor: getFeedFor,
  getFeedSince: getFeedSince,
  postStatusUpdate: postStatusUpdate,
};

module.exports = routes;
