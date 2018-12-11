var db = require('../models/userDB.js');

var getLogin = function(req, res) {
  res.render('main.ejs', {error: ""});
};

var verifyOrCreate = function(req, res) {
  if (req.body.loginbtn === "LOG IN") {
    verifyLogin(req, res);
  } else {
    createAccount(req, res);
  }
}

var createAccount = function(req, res) {
  var ERROR_MSG = "";

  var username = req.body.username;
  if (!username) {
    ERROR_MSG = "No username provided!";
  }
  var password = req.body.password;
  if (!password) {
    ERROR_MSG = "No password provided!";
  }

  var firstName = req.body.firstname;
  if (!firstName) {
    ERROR_MSG = "No firstName provided!";
  }

  var lastName = req.body.lastname;
  if (!lastName) {
    ERROR_MSG = "No lastName provided!";
  }
  // Validate birthday values
  var birthday = req.body.birthday;
  if (!birthday) {
    ERROR_MSG = "No birthday provided!";
  }
  var affiliation = req.body.affiliation;
  if (!affiliation) {
    ERROR_MSG = "No affiliation provided!";
  }
  var permissions = req.body.permissions;
  if (!permissions) {
    permissions = 1;
  }
  if (ERROR_MSG != "") {
    res.render('main.ejs', {error: ERROR_MSG});
    console.log("error, with error: " + ERROR_MSG);
    return;
  }
  db.addUser(username, password, firstName, lastName, birthday, affiliation, permissions, function(data, err) {
    if (err) {
      console.log("ERROR!!!!");
      res.render('main.ejs', {error: err});
    } else if (data) {
    	req.session.account = data.username;
      console.log("successfully added");
      res.render('newsfeed.ejs');
    	// Logged in correctly
    }
  });
};

var verifyLogin = function(req, res) {
  var ERROR_MSG = "";
  var username = req.body.username;
  if (!username) {
    ERROR_MSG = "No username provided!";
  }
  var password = req.body.password;
  if (!password) {
    ERROR_MSG = "No password provided!";
  }
  if (ERROR_MSG != "") {
    res.render('signup.ejs', {error: ERROR_MSG});
    return;
  }
  db.verifyLogin(username, password, function(data, err) {
    if (err) {
      res.render('main.ejs', {error: err});
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
  verifyOrCreate: verifyOrCreate,
  logout: logout,
};

module.exports = routes;
