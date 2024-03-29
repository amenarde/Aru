var vogels = require('vogels');

// vogels.AWS.config.loadFromPath('../config.json');
vogels.AWS.config.loadFromPath('config.json');

var chatDB = require('../models/chatDB.js')
var userDB = require('../models/userDB.js');

module.exports = {
  test: function() {
    vogels.createTables(function(err) {
      if (err) {
        console.log('Error creating tables: ', err);
      } else {
          userDB.addUser('amenarde',
                  'antonio',
                  'menarde',
                  '1996/12/17',
                  'Penn',
                  1,
                  function(data, err){});
    
          userDB.addUser('jpat',
                  'patrick',
                  'taggart',
                  '1996/07/02',
                  'Penn State',
                  1,
                  function(data, err){});
    
          userDB.addUser('tyue',
                  'tiffany',
                  'yue',
                  '1996/10/14',
                  'Penn',
                  1,
                  function(data, err){});
    
          chatDB.createChat(['jpat', 'amenarde'],
                  function(data, err){
                    Console.log('Chat created with id' + data);
                  });
      }
    });
  }
} 