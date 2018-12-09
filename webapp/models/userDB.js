var schemas = require("./schemas.js");


function addUser(username, firstName, lastName, birthday, affiliation, permissions, callback) {
  // Convert the birthday to a value
  var dates = birthday.split("/");
  if (dates.length === 1) {
    dates = birthday.split("-");
    if (dates.length === 1) {
      dates = birthday.split(":");
    }
  }
  // Does not standardize european dates...
  var birthdayString = "";
  for (let i in dates) {
    birthdayString += dates[i];
  }

  console.log("birthday: " + birthdayString + " becomes " + Number(birthdayString));
  var obj = {
		username: username,
    firstName: firstName,
    lastName: lastName,
    birthday: Number(birthdayString),
    affiliation: affiliation,
    permissions: permissions};

  console.log(obj);
  schemas.Users.create({
		username: username,
    firstName: firstName,
    lastName: lastName,
    birthday: Number(birthdayString),
    affiliation: affiliation,
    permissions: permissions}, {overwrite: false},
    function(err, user) {
      if (err) {
        console.log("USER_DB) Error adding user " + username + "\n" + err);
      } else {
        console.log("USER_DB) Adding user " + username);
      }
      
      callback(user, err);
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

function updateAffiliation(username, a, callback) {
  schemas.Users.update({username: username, affiliation: a}, function (err, user) {
    if (err) {
      console.log("USER_DB) Update affiliation - " + err)
    } else {
      console.log('USER_DB) Update affiliation to ' + a + ' for:', user.get('username'));
    }
    callback(user, err);
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

var database = { 
  addUser: addUser,
  get: fetch,
  delete: deleteUser,
  exists: exists,
  updatePermissions: updatePermissions,
  updateAffiliation: updateAffiliation,
  updateBirthday: updateBirthday,
  updateFirstName: updateFirstName,
  updateFirstName: updateLastName,
};
                                        
module.exports = database;
                                        
