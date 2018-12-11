var schemas = require("./schemas.js");
var bcrypt = require('bcrypt');


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

  console.log("birthday: " + birthdayString + " becomes " + Number(birthdayString));

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
          birthday: Number(birthdayString),
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
    if (user) {
      callback(true, err);
    } else {
      callback(false, err);
    }
  });
}

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

function updateBirthday(username, birthday, callback) {
  schemas.Users.update({username: username, birthday: birthday}, function (err, user) {
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

function fetch(username) {
  schemas.Users.get(username, function(err, user) {
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

var database = {
  addUser: addUser,
  get: fetch,
  verifyLogin: verifyLogin,
  delete: deleteUser,
  exists: exists,
  updatePermissions: updatePermissions,
  updateAffiliation: updateAffiliation,
  updateBirthday: updateBirthday,
  updateFirstName: updateFirstName,
  updateFirstName: updateLastName,
};

module.exports = database;

