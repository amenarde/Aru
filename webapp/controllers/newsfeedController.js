var Heap = require('heap');
var StatusesDB = require('../models/statusDB.js');
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
    // Get friends of user (async!)
    let username = req.session.account;
    if (!username) {
        res.send({error: "Something went wrong. Please log in again!"});
    } else {
        constructFeedForUser(username, function(feed, err) {
            if (err) {
                res.send({error: err});
            } else {
                // Return list
                res.send({feed: feed});
            }
        });
    }
};

function constructFeedForUser(username, callback) {
    // Get all my friends (async!)
    FriendshipDB.getFriends(username, function(friends, err) {
        if (err) {
            callback(null, err);
        } else {
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
                // Statuses
                StatusesDB.getLastX(friends[i].get('name2'), PAGE_SIZE, function(res, err) {
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
                // Updates

            }
        }
    });
}

function constructFeedFromHeap(postHeap, callback) {
    let feed = [];
    // Pull desired entries from the heap
    for (let i = 0; i < PAGE_SIZE; i++) {
        feed.push(postHeap.pop());
    }
    // Return list
    callback(feed, null);
}

//used in periodic News Feed refresh
//e.g. give me posts since this timestamp
var getFeedSince = function(req, res) {

};


var routes = {
  open: open,
  getFeedFor: getFeedFor,
  getFeedSince: getFeedSince,
};

module.exports = routes;
