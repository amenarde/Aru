var db = require('../models/userDB.js');

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
      res.render('newsfeed.ejs');
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
      res.render('newsfeed.ejs');
    }
  });
};

var logout = function(req, res) {
	req.session.destroy();
	res.render('main.ejs', {error: "You have been logged out"});
};

var routes = {
  loginOrSignup: getLogin,
  verify: verifyLogin,
  create: createAccount,
  logout: logout,
};

module.exports = routes;
