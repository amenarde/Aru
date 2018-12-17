var schema = require("../models/schemas.js");
var userDB = require("../models/userDB.js");
var async = require('async');

function friendVisualization(req, res) {
    var myusername = req.session.account;

    schema.Friendships.query(myusername).loadAll().exec(function(err, data){
        if (data.Count === 0) {
            userDB.get(myusername, function(user, err) {
                var graph = {"id": myusername,"name": (user.attrs.firstName + " " + user.attrs.lastName),"children": []};
                res.send(graph);
                return;
            });
        }

        var children = [];

        async.each(data.Items, function(friendInfo, completed) {
            if (friendInfo.attrs.status === 'confirmed') {
                userDB.get(friendInfo.attrs.user2, function(user, err) {
                    children.push({
                        "id": user.attrs.username,
                        "name": (user.attrs.firstName + " " + user.attrs.lastName),
                        "data": {},
                        "children": []
                    });
                    completed(null); 
                });
            } else {
                completed(null); 
            }
        }, function (err) {
            userDB.get(myusername, function(user, err) {
                var graph = {"id": myusername,"name": (user.attrs.firstName + " " + user.attrs.lastName),"children": children};
                res.send(graph);
            });
        });
    });
}

function getFriends(req, res) {
    var myusername = req.session.account;
    var myfriend = req.params.user;

    schema.Friendships.query(myfriend).loadAll().exec(function(err, data){
        if (data.Count === 0) {
            userDB.get(myusername, function(user, err) {
                var graph = {"id": myfriend,"name": (user.attrs.firstName + " " + user.attrs.lastName),"children": []};
                res.send(graph);
                return;
            });
        }

        var children = [];

        userDB.get(myusername, function(myinfo, err) {
            var myaffiliation = myinfo.attrs.affiliation;

            async.each(data.Items, function(friendInfo, completed) {
                if (friendInfo.attrs.status === 'confirmed') {
                    userDB.get(friendInfo.attrs.user2, function(user, err) {

                            if (user.attrs.affiliation === myaffiliation) {
                                children.push({
                                    "id": user.attrs.username,
                                    "name": (user.attrs.firstName + " " + user.attrs.lastName),
                                    "data": {},
                                    "children": []
                                });
                            }
                            completed(null); 
                    });
                } else {
                    completed(null); 
                }
            }, function (err) {
                userDB.get(myfriend, function(user, err) {
                    var graph = {"id": myfriend,"name": (user.attrs.firstName + " " + user.attrs.lastName),"children": children};
                    res.send(graph);
                });
            });

        });
    });
}

var routes = {
    friendvisualization: friendVisualization,
    getfriends: getFriends
  };
  
  module.exports = routes;