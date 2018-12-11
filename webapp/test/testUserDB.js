var vogels = require('vogels');
vogels.AWS.config.loadFromPath('../config.json');
var userDB = require('../models/userDB.js');

vogels.createTables(function(err) {
    if (err) {
      console.log('Error creating tables: ', err);
    } else {
      console.log('Tables has been created');
    }
  });

userDB.addUser('amenarde',
               'KGB',
               'antonio',
               'menarde',
               '1996/12/17',
               'Penn',
               1,
               function(data, err){});

userDB.addUser('jpat',
               'KGB',
               'patrick',
               'taggart',
               '1996/07/02',
               'Penn State',
               1,
               function(data, err){});

userDB.addUser('tyue',
               'KGB',
               'tiffany',
               'yue',
               '1996/10/14',
               'Penn',
               1,
               function(data, err){});

function testAddUser() {
    userDB.addUser('tyue',
                    'KGB',
                    'tiffany',
                    'yue',
                    '1996/10/14',
                    'Penn',
                    1,
                    function(data, err){});
}

function testAddDuplicate() {
    userDB.addUser('Rick',
        'KGB',
        'Aldrich',
        'Ames',
        '1941/5/26',
        'Penn',
        1,
        function(data, err){});
    userDB.addUser('Rick',
        'KGB',
        'Aldrich',
        'Ames',
        '1941/5/26',
        'Penn',
        1,
        function(data, err){});
}

function testAddDuplicateExceptUsername() {
    userDB.addUser('CIA',
        'KGB',
        'Aldrich',
        'Ames',
        '1941/5/26',
        'Penn',
        1,
        function(data, err){});
    userDB.addUser('KGB',
        'KGB',
        'Aldrich',
        'Ames',
        '1941/5/26',
        'Penn',
        1,
        function(data, err){});
}

function testInvalidBirthday() {
    userDB.addUser('testReject',
        'KGB',
        'Aldrich',
        'Ames',
        '1941/5/26',
        'Penn',
        1,
        function(data, err){});
    userDB.addUser('testReject',
        'KGB',
        'Aldrich',
        'Ames',
        '1941/5/26',
        'Penn',
        1,
        function(data, err){});
    userDB.addUser('KGB',
        'KGB',
        'Aldrich',
        'Ames',
        '1941/5/26',
        'Penn',
        1,
        function(data, err){});
}

function testAddUser() {
    userDB.addUser('tyue',
                    'KGB',
                    'tiffany',
                    'yue',
                    '1996/10/14',
                    'Penn',
                    1,
                    function(data, err){});
}