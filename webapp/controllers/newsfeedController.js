var Heap = require('heap');
var StatusesDB = require('../models/statusDB.js');

var open = function(req, res) {
  res.render('newsfeed.ejs', {error: ""});
};

//used in initial News Feed population and older post loading
//e.g. give me most recent 0-10, give me most recent pageOffset + updateOffset
var getFeedFor = function(req, res) {
    // Get cached values of friends
    // Get friends of user (async!)

    // Get 10 entries for each friend for user (async!)
    // Put all values in heap
    let postsHeap = new Heap(function(a, b) {
        // Custom comparator for entires
        if (new Date(a.get('createdAt')) > new Date(b.get('createdAt'))) {
            return 1
        } else {
            return 0
        }
    });
    for (let i = 0; i < friends.length; i++) {
        // Statuses
        // StatusesDB.get()
        // Updates

    }
        
    
    // Pull desired entries from the heap
    // Return list
};

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
