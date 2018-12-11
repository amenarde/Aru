var open = function(req, res) {
  res.render('newsfeed.ejs', {error: ""});
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
