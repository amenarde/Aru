var db = require('../models/userDB.js');

var getlogin = function(req, res) {
  res.render('main.ejs', {error: ""});
};

var verifyOrCreate = function(req, res) {
  console.log("login " + req.body.loginbtn);
  console.log("signup " + req.body.signupbtn);
  if (req.body.loginbtn === "LOG IN") {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var birthday = req.body.birthday;
    var affiliation = req.body.affiliation;
    var username = req.body.username;
    var password = req.body.password;
    db.createaccount(firstname, lastname, birthday, affiliation, username, password, function(data, err) {
      if (err) {
        res.render('main.ejs', {error: err});
      } else if (data) {
        req.session.account = data.username;
        // Logged in correctly
        res.redirect('/newsfeed');
      }
    });
  } else {
    var username = req.body.username;
    var password = req.body.password;
    db.verifylogin(username, password, function(data, err) {
      if (err) {
        res.render('main.ejs', {error: err});
      } else if (data) {
        req.session.account = data.username;
        // Logged in correctly
        res.redirect('/newsfeed');
      }
    });
  }
}

var logout = function(req, res) {
	req.session.destroy();
	res.render('main.ejs', {error: "You have been logged out"});
};

var routes = {
  loginOrSignup: getlogin,
  verifyOrCreate: verifyOrCreate,
  logout: logout,
};

module.exports = routes;
