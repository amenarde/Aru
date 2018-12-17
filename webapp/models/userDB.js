var schemas = require("./schemas.js");
var bcrypt = require('bcrypt');
var async = require('async');

function addAffiliation(affiliation, username, callback) {
  schemas.Affiliations.create({
     username: username,
     affiliation: affiliation
  }, {overwrite: false},
  function(err, aff) {
    if (err) {
      console.log("AffiliationDB) Failed to add " + username + " - " + affiliation);
      callback(null, err);
    } else {
      console.log("AffiliationDB) Added " + username + " - " + affiliation);
      callback(aff, null);
    }
  });
}

function deleteAffiliation(affiliation, username, callback) {
  schemas.Affiliations.destroy({
      username: username,
      affiliation: affiliation
  },
  function(err, aff) {
    if (err) {
      console.log("AffiliationDB) Failed to delete " + username + " - " + affiliation);
      callback(null, err);
    } else {
      console.log("AffiliationDB) Deleted " + username + " - " + affiliation);
      callback(aff, null);
    }
  });
}

function addUser(username, password, firstName, lastName, birthday, affiliation, permissions, callback) {
  // Convert the birthday to a value
  let birthdayNum = encodeBirthday(birthday);

  console.log("birthday: " + birthday + " becomes " + Number(birthdayNum));

  // Add use to the database - start with its affiliation in case
  // Add affiliation to the database
  addAffiliation(affiliation, username, function(aff, err) {
    if (err) {
      callback(null, err);
    } else {
      // Add user to the database
      bcrypt.hash(password, 5, function(err, hash) {
        schemas.Users.create({
          username: username,
          firstName: firstName,
          lastName: lastName,
          password: hash,
          birthday: birthdayNum,
          affiliation: affiliation,
          permissions: permissions}, {overwrite: false},
          function(err, user) {
            if (err) {
              console.log("Error adding user " + username + "\n" + err);
              // Delete affiliation we made
              deleteAffiliation(affiliation, username, function(err2, data) {
                callback(null, "Error adding user " + username + "\n" + err);
              });
            } else {
              console.log("USER_DB) Adding user " + username);
              callback(user, null);
            }
          }
        );
      });
    }
  });
}

function exists(username, callback) {
  fetch(username, function(user, err) {
    if (user != null) {
      callback(true, err);
    } else {
      callback(false, err);
    }
  });
}

function updateUser(userData, callback) {
  // Username must be an attribute of userData
  if (userData.birthday) {
    userData.birthday = encodeBirthday(userData.birthday);
  }
  schemas.Users.update(userData, function (err, user) {
    if (err) {
      console.log("USER_DB) Update first name - " + err)
    } else {
      console.log('USER_DB) Updated user info');
    }
    callback(user, err);
  });
}

// Tested - worked (for well formed inputs)
function updateFirstName(username, name, callback) {
  schemas.Users.update({username: username, firstName: name}, function (err, user) {
    if (err) {
      console.log("USER_DB) Update first name - " + err)
    } else {
      console.log('USER_DB) Update first name to ' + name + ' for:', user.get('username'));
    }
    callback(user, err);
  });
}

// Tested - worked (for well formed inputs)
function updateLastName(username, name, callback) {
  schemas.Users.update({username: username, lastName: name}, function (err, user) {
    if (err) {
      console.log("USER_DB) Update last name - " + err)
    } else {
      console.log('USER_DB) Update last to ' +  name + ' for:', user.get('username'));
    }
    callback(user, err);
  });
}

function encodeBirthday(birthday) {
  var dates = birthday.split("/");
  if (dates.length === 1) {
    dates = birthday.split("-");
    if (dates.length === 1) {
      dates = birthday.split(":");
    }
  }
  // TODO Validate birthday?

  // Does not standardize european dates...
  var birthdayString = "";
  for (let i in dates) {
    birthdayString += dates[i];
  }
  return Number(birthdayString);
}

function decodeBirthday(birthdayNum) {
  // Is in yyyymmdd
  var birthdayString = String(birthdayNum);
  // TODO Validate birthday?
  var birthday = birthdayString.slice(0, 4) + "/" + birthdayString.slice(4,6) + "/" + birthdayString.slice(6,8);
  return new Date(birthday);
}

function updateBirthday(username, birthday, callback) {
  let birthdayNum = encodeBirthday(birthday);
  schemas.Users.update({username: username, birthday: birthdayNum}, function (err, user) {
    if (err) {
      console.log("USER_DB) Update username - " + err)
    } else {
      console.log('USER_DB) Update birthday to ' + birthday + ' for:', user.get('username'));
    }
    callback(user, err);
  });
}

// Double check this code
function updateAffiliation(username, a, callback) {
  // Update user schema
  schemas.Users.update({username: username, affiliation: a}, function (err, user) {
    if (err) {
      console.log("USER_DB) Update affiliation - " + err)
      callback(null, err);
    } else {
      console.log('USER_DB) Update affiliation to ' + a + ' for:', user.get('username'));
      // Update affiliation DB (add new, delete old)
      addAffiliation(a, username, function(a, errA) {
        if (errA) {
          // Need to repeal change to user now
          schemas.Users.update({username: username, affiliation: user.get("affiliation")}, function (aNew, errU) {
            if (errU) {
              // Now the userDB and affiliation DB are out of sync...
              callback(null, errA + "\n" + errU);
            } else {
              // Nothing changes (but still in sync!)
              callback(null, errA);
            }
          });
        } else {
          // Delete old affiliation
          deleteAffiliation({username: username, affiliation: user.get("affiliation")}, function(user, errZ) {
            if (errZ) {
              // Now have duplicates in database
              callback(null, errZ);
            } else {
              // Everything should be fixed
              callback(user, null);
            }
          })
        }
      });
    }
  });
}

function updatePermissions(username, p, callback) {
  schemas.Users.update({username: username, permissions: p}, function (err, user) {
    if (user) {
      console.log("USER_DB) Update permissions - " + err)
    } else {
      console.log('USER_DB) Update permissions to ' + p +  ' for user:', user.get('username'));
    }
    callback(user, err);
  });
}

function deleteUser(username, callback) {
  schemas.Users.destroy(username, function (err) {
    console.log('USER_DB) User deleted: ' + username);
    callback(null, err);
  });
}

function fetch(username, callback) {
  if (!username) {
    callback(null, "Something went wrong. Please log in.");
  }
  schemas.Users.get(username, function(err, user) {
    // Need to update birthday
    user.attrs.birthday = decodeBirthday(user.attrs.birthday);
    callback(user, err);
  });
}

function verifyLogin(username, password, callback) {
  schemas.Users.get(username, function(err, user) {
    if (err) {
      callback(null, err);
    }
    else if (user === null) {
      callback(null, "User does not exist")
    }
    else {
      bcrypt.compare(password, user.get('password'), function(err, res) {
        if (err) {
          callback(null, "Error handling request, try again.");
        }
        if(res) {
         // Passwords match
         callback(username, null);
        } else {
         // Passwords don't match
         callback(null, "Invalid password");
        }
      });
    }
  });
}

function addInsterest(username, interest, callback) {
  schemas.User2Interests.create({username: username, interest:interest}, {overwrite: false}, function(err, u2i) {
    if (err) {
      callback(null, err);
    } else {
      schemas.Interests2User.create({username: username, interest: interest}, {overwrite: false}, function(err, i2u) {
        if (err) {
          schemas.User2Interests.destroy({username: username, interest: interest}, function(errDestroy) {
            if (errDestroy) {
              callback("Database in unstable state!\n" + errDestroy + "\n" + err);
            } else {
              callback(null, err);
            }
          });
        } else {
          callback(u2i, null);
        }
      });
    }
  });
}

function removeInterest(username, interest, callback) {
  schemas.User2Interests.destroy({username: username, interest: interest}, function(err) {
    if (err) {
      callback(null, err);
    } else {
      schemas.Interests2User.destroy({username: username, interest: interest}, function(err) {
        if (err) {
          schemas.User2Interests.create({username: username, interest: interest}, function(errCreate) {
            if (errCreate) {
              callback(null, "Database in unstable state!\n" + errCreate + "\n" + err);
            } else {
              callback(null, err);
            }
          });
        } else {
          callback(null, null);
        }
      });
    }
  });
}

function fetchInterests(username, callback) {
  schemas.User2Interests.query(username)
  .loadAll()
  .exec(function(err, interests) {
      if (err) {
          callback(null, err);
      } else {
          callback(interests, null);
      }
  });
}

function getUsersByPrefix(prefix, callback) {

  var searchResults = [];

  schemas.Users.scan()
  .where('username').beginsWith(prefix)
  .exec(function(err, results) {
    if (results === null) {
      callback(searchResults, null);
      return;
    }

    async.each(results.Items, function(user, completed) {
      searchResults.push({username: user.attrs.username, name: user.attrs.firstName + " " + user.attrs.lastName});
      completed();
    }, function(err) {
      callback(searchResults, null);
    });
  });
}

var database = {
  addUser: addUser,
  get: fetch,
  verifyLogin: verifyLogin,
  delete: deleteUser,
  exists: exists,
  updateUser: updateUser,
  updatePermissions: updatePermissions,
  updateAffiliation: updateAffiliation,
  updateBirthday: updateBirthday,
  updateFirstName: updateFirstName,
  updateLastName: updateLastName,
  addInsterest: addInsterest,
  removeInterest: removeInterest,
  getUsersByPrefix: getUsersByPrefix,
};

module.exports = database;

