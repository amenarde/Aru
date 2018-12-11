var db = require('../models/userDB.js');

var getLogin = function(req, res) {
  res.render('main.ejs', {error: "", signupState: false, missing: []});
};

var createAccount = function(req, res) {
  var ERROR_MSG = "";
  var MISSING_FIELDS = [];

  var username = req.body.username;
  if (!username) {
    ERROR_MSG = "One or more fields are missing.";
    MISSING_FIELDS.push("username");
  }
  var password = req.body.password;
  if (!password) {
    ERROR_MSG = "One or more fields are missing.";
    MISSING_FIELDS.push("password");
  }

  var firstName = req.body.firstname;
  if (!firstName) {
    ERROR_MSG = "One or more fields are missing.";
    MISSING_FIELDS.push("firstname");
  }

  var lastName = req.body.lastname;
  if (!lastName) {
    ERROR_MSG = "One or more fields are missing.";
    MISSING_FIELDS.push("lastname");
  }
  // Validate birthday values
  var birthday = req.body.birthday;
  if (!birthday) {
    ERROR_MSG = "One or more fields are missing.";
    MISSING_FIELDS.push("birthday");
  }
  var affiliation = req.body.affiliation;
  if (!affiliation) {
    ERROR_MSG = "One or more fields are missing.";
    MISSING_FIELDS.push("affiliation");
  }
  var permissions = req.body.permissions;
  if (!permissions) {
    permissions = 1;
  }
  if (ERROR_MSG != "") {
    console.log(ERROR_MSG);
    res.render('main.ejs', {error: ERROR_MSG, signupState: true, missing: MISSING_FIELDS});
    return;
  }
  db.addUser(username, password, firstName, lastName, birthday, affiliation, permissions, function(data, err) {
    if (err) {
      res.render('main.ejs', {error: err});
    } else if (data) {
    	req.session.account = data.username;
      res.render('newsfeed.ejs');
    	// Logged in correctly
    }
  });
};

var verifyLogin = function(req, res) {
  var ERROR_MSG = "";
  var MISSING_FIELDS = [];

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
      res.render('main.ejs', {error: err, signupState: false, missing: []});
    } else if (data) {
    	req.session.account = data.username;
      // Logged in correctly
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
