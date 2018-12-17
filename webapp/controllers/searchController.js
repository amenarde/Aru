var userDB = require('../models/userDB.js');

function search(req, res) {
    var prefix = req.body.prefix;
    userDB.getUsersByPrefix(prefix, function(results, error) {
        res.send(results);
    });
}


var routes = {
    search: search
  };

  module.exports = routes;
