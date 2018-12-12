var vogels = require('vogels');
vogels.AWS.config.loadFromPath('config.json');
var schema = require('./models/schemas.js');

vogels.createTables(function(err) {
      if (err) {
        console.log('Error creating tables: ', err);
      } else {
        console.log('Created successfully');
      }
});
