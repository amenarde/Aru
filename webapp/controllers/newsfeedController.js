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
var getFeedFor = function(req, res) {

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
