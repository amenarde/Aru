var db = require('../models/database.js');

var getlogin = function(req, res) {
  res.render('main.ejs', {error: ""});
};

var getsignup = function(req, res) {
	  res.render('signup.ejs', {error: ""});
};

var createaccount = function(req, res) {
	
  var username = req.body.username;
  var password = req.body.password;
  var fullname = req.body.fullname;
  db.createaccount(username, password, fullname, function(data, err) {
    if (err) {
      res.render('signup.ejs', {error: err});
    } else if (data) {
    	req.session.account = data.username;
    	// Logged in correctly
    }
  });
};

var verifylogin = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
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
