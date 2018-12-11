var open = function(req, res) {
  res.render('newsfeed.ejs', {error: ""});
};

var routes = {
  open: open,
};

module.exports = routes;
