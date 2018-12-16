var db = require('../models/userDB.js');
var FriendshipDB = require("../models/friendsDB.js");
var PostDB = require("../models/postsDB.js");

var getLogin = function(req, res) {
  res.render('main.ejs', {error: ""});
};

var createAccount = function(req, res) {
  var ERROR_MSG = "";

  var username = req.body.username;
  if (!username) {
    ERROR_MSG = "One or more fields are missing.";
  }

  var password = req.body.password;
  if (!password) {
    ERROR_MSG = "One or more fields are missing.";
  }

  var firstName = req.body.firstname;
  if (!firstName) {
    ERROR_MSG = "One or more fields are missing.";
  }

  var lastName = req.body.lastname;
  if (!lastName) {
    ERROR_MSG = "One or more fields are missing.";
  }
  // Validate birthday values
  var birthday = req.body.birthday;
  if (!birthday) {
    ERROR_MSG = "One or more fields are missing.";
  }
  var affiliation = req.body.affiliation;
  if (!affiliation) {
    ERROR_MSG = "One or more fields are missing.";
  }
  var permissions = req.body.permissions;
  if (!permissions) {
    permissions = 1;
  }
  if (ERROR_MSG != "") {
    res.render('main.ejs', {error: ERROR_MSG});
    return;
  }
  db.addUser(username, password, firstName, lastName, birthday, affiliation, permissions, function(data, err) {
    if (err) {
      res.render('main.ejs', {error: err});
    } else if (data) {
    	req.session.account = data.username;
      res.redirect('/newsfeed');
    }
  });
};

var verifyLogin = function(req, res) {
  var ERROR_MSG = "";

  var username = req.body.username;
  if (!username) {
    ERROR_MSG += "No username provided ";
  }
  var password = req.body.password;
  if (!password) {
    ERROR_MSG += "No password provided ";
  }
  if (ERROR_MSG != "") {
    res.render('main.ejs', {error: ERROR_MSG});
    return;
  }
  db.verifyLogin(username, password, function(data, err) {
    if (err) {
      res.render('main.ejs', {error: err});
    } else if (data) {
      // Logged in correctly
    	req.session.account = data;
      res.redirect('/newsfeed');
    }
  });
};

var logout = function(req, res) {
	req.session.destroy();
	res.render('main.ejs', {error: "You have been logged out"});
};

function acceptFriendRequest(req, res) {

  let user = req.session.account;
  if (!user) {res.render('main.ejs', {error: "You must be logged in to perform that action."});}
  let user2 = req.body.friender;
  // user2 is the person who initia
  // Check if friends
  FriendshipDB.checkFriendship(user, user2, function(status, err) {
    if (err) {
      res.send({error: err});
    } else {
      console.log("Status: " + status);
      if (status === "confirmed") {
        res.send({error: "Already friends!"});
      } else if (status === "incoming") {
        // Should check if there is pending request
        FriendshipDB.acceptRequest(user, user2, function(friendship, err) {
          if (err) {
            res.send({error: err});
          } else {
            newFriendship(user, user2, function(post, error) {
              if (error) {
                res.send({error: error});
              } else {
                res.send({post: post})
              }
            });
          }
        });
      } else {
        res.send({error: "No friend request incoming!"});
      }
    }
  });
}

// Tested - works (for hardcoded values of user and user2)
function rejectFriendRequest(req, res) {
  let user = req.session.account;
  if (!user) {res.render('main.ejs', {error: "You must be logged in to perform that action."});}
  let user2 = req.body.friender;
  FriendshipDB.rejectRequest(user, user2, function(err) {
    res.send({error: err});
  });
}

// Tested - works (for hardcoded values of user and user2)
function issueFriendRequest(req, res) {
  let user = req.session.account;
  if (!user) {res.render('main.ejs', {error: "You must be logged in to perform that action."});}
  let user2 = req.body.friender.slice(0, -1);
  FriendshipDB.friendRequest(user, user2, function(friends, err) {
    res.send({friends: friends, error: err});
  });
}

function removeFriend(req, res) {
  let user = req.session.account;
  if (!user) {res.render('main.ejs', {error: "You must be logged in to perform that action."});}
  let user2 = req.body.friender;
  FriendshipDB.removeFriend(user, user2, function(friends, err) {
    res.send({error: err});
  });
}

function getPendingRequest(req, res) {
  let user = req.session.account;
  if (!user) {res.render('main.ejs', {error: "You must be logged in to perform that action."});}
  FriendshipDB.getIncomingRequest(user, function(incoming, err) {
    res.send({error: err, friendRequests: incoming});
  });
}

function getFriends(req, res) {
  let user = req.session.account;
  if (!user) {res.render('main.ejs', {error: "You must be logged in to perform that action."});}
  FriendshipDB.getFriends(user, function(friends, err) {
    // Might have to encode to database objects
    res.send({friends: friends, error: err});
  });
}

function updateInfo(req, res) {
  let newFirst = req.body.firstName;
  let lastName = req.body.lastName;
  let birthday = req.body.birthday;
  let affiliation = req.body.affiliation;

  userData = {
    username: req.session.account,
  };

  if (newFirst != "") {
    userData['firstName'] = newFirst;
  }
  if (lastName != "") {
    userData['lastName'] = lastName;
  }
  if (birthday != "") {
    userData['birthday'] = birthday;
  }
  if (affiliation != "") {
    userData['affiliation'] = affiliation;
  }

  console.log("userData is: " + JSON.stringify(userData));

  db.updateUser(userData, function(user, err) {
    if (err) {
      res.send({error: err});
    } else {
      res.redirect('back');
    }
  })
}

// Tested with hardcoded values worked
function updateFirstName(req, res) {
  let username = req.session.account;

  if (!username) {res.render('main.ejs', {error: "You must be logged in to perform that action."});}
  let newFirst = req.body.firstName;

  db.updateFirstName(username, newFirst, function(success, err) {
    console.log("Update first name: " + success);
    if (err) {
      res.send({error: err});
    } else {
      profileUpdate(username, "first name", newFirst, function(success, err) {
        console.log("Status for update: " + success);
        res.send({error: err, success: success});
      });
    }
  });
}

function updateLastName(req, res) {
  let username = req.session.account;

  if (!username) {res.render('main.ejs', {error: "You must be logged in to perform that action."});}
  let lastName = req.body.lastName;

  db.updateLastName(username, lastName, function(success, err) {
    if (err) {
      res.send({error: err});
    } else {
      profileUpdate(username, "last name", lastName, function(success, err) {
        res.send({error: err, success: success});
      });
    }
  });
}

function updateBirthday(req, res) {
  let username = req.session.account;

  if (!username) {res.render('main.ejs', {error: "You must be logged in to perform that action."});}
  let birthday = req.body.birthday;

  db.updateLastName(username, birthday, function(success, err) {
    if (err) {
      res.send({error: err});
    } else {
      profileUpdate(username, " birthday ", birthday, function(success, err) {
        res.send({error: err, success: success});
      });
    }
  });
}

// Double check this code
function updateAffiliation(req, res) {
  let username = req.session.account;

  if (!username) {res.render('main.ejs', {error: "You must be logged in to perform that action."});}
  let affiliation = req.body.affiliation;

  db.updateLastName(username, affiliation, function(success, err) {
    if (err) {
      res.send({error: err});
    } else {
      profileUpdate(username, "affiliation", affiliation, function(success, err) {
        res.send({error: err, success: success});
      });
    }
  });
}

function aggregateProfileUpdate(userData, callback) {
  let statusUpdates = [];
  for (var property in userData) {
    if (userData.hasOwnProperty(property) && property != "username") {
      async.each(posts.Items, function(post, completed) {
        profileUpdate(userData.username, property, userData[property], function(update, err) {
          if (!err) {
            statusUpdates.push(update);
          }
          completed(err);
        });

      }, function (err) {
        callback(statusUpdates, err);
      });

    }
}
}

function profileUpdate(username, attribute, value, callback) {
  // Create a post about it
  createPost(username, attribute + " to " + value, "profileUpdate", username, function(success, err) {
    callback(success, err);
  });
}
function newFriendship(username, user2, callback) {
    createPost(username, username + " became friends with " + user2, "newFriendship", user2, function(success, err) {
      if (err) {
        console.log("Could not make status for new friendship between " + username + " and " + user2);
        callback(null, err);
      } else {
        // Make a post for the other user as well
        createPost(user2, user2 + " became friends with " + username, "newFriendship", username, function(success, err) {
          if (err) {
            console.log("Friendship status update made for " + username + " but not for " + user2);
          }
          callback(success, err);
        })
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

var routes = {
  loginOrSignup: getLogin,
  verify: verifyLogin,
  create: createAccount,
  logout: logout,
  acceptFriendRequest: acceptFriendRequest,
  rejectFriendRequest: rejectFriendRequest,
  issueFriendRequest: issueFriendRequest,
  getFriends: getFriends,
  getFriendRequests: getPendingRequest,
  updateInfo: updateInfo,
  updateAffiliation: updateAffiliation,
  updateBirthday: updateBirthday,
  updateFirstName: updateFirstName,
  updateLastName: updateLastName,
  removeFriend: removeFriend,
};

module.exports = routes;
