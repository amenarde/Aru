var db = require('../models/userDB.js');

var getlogin = function(req, res) {
  res.render('main.ejs', {error: ""});
};

var getsignup = function(req, res) {
	  res.render('signup.ejs', {error: ""});
};

var createaccount = function(req, res) {
  var ERROR_MSG = "";
  var username = req.get("username");
  if (!username) {
    ERROR_MSG = "No username provided!";
  }
  var password = req.get("password");
  if (!password) {
    ERROR_MSG = "No password provided!";
  }
  var lastName = req.get("firstName");
  if (!lastName) {
    ERROR_MSG = "No lastName provided!";
  }
  // Validate birthday values
  var birthday = req.get("birthday");
  if (!birthday) {
    ERROR_MSG = "No birthday provided!";
  }
  var affiliation = req.get("affiliation");
  if (!affiliation) {
    ERROR_MSG = "No affiliation provided!";
  }
  var permissions = req.get("permissions");
  if (!permissions) {
    ERROR_MSG = "No permissions provided!";
  }
  if (ERROR_MSG != "") {
    res.render('signup.ejs', {error: err});
    return;
  }
  db.add(username, password, firstName, lastName, birthday, affiliation, permissions, function(data, err) {
    if (err) {
      res.render('signup.ejs', {error: err});
    } else if (data) {
    	req.session.account = data.username;
    	// Logged in correctly
    }
  });
};

var verifylogin = function(req, res) {
  var ERROR_MSG = "";
  var username = req.get("username");
  if (!username) {
    ERROR_MSG = "No username provided!";
  }
  var password = req.get("password");
  if (!password) {
    ERROR_MSG = "No password provided!";
  }
  if (ERROR_MSG != "") {
    res.render('signup.ejs', {error: err});
    return;
  }
  db.verifylogin(username, password, function(data, err) {
    if (err) {
      res.render('main.ejs', {error: err});
    } else if (data) {
    	req.session.account = data.username;
      // Logged in correctly
    }
  });
};

var logout = function(req, res) {
	req.session.destroy();
	res.render('main.ejs', {error: "You have been logged out"});
};

var routes = { 
  login: getlogin,
  signup: getsignup,
  verifylogin: verifylogin,
  createaccount: createaccount,
  logout: logout,
};

module.exports = routes;
