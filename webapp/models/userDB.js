var keyvaluestore = require('../models/keyvaluestore.js');

var userKVS = new keyvaluestore('users');
userKVS.init(function(err, data){});

var async = require('async');


var verifylogin = function(username, password, route_callbck){
  console.log('Trying to log in: ' + username);	
  userKVS.get(username, function (err, data) {
    if (err) {
      route_callbck(null, "login error: "+err);
    } else if (data === null) {
      route_callbck(null, "User does not exist");
    } else {
      var realPassword = JSON.parse(data[0].value).password;
      if (password === realPassword) {
          route_callbck({ "username" : username }, null);
      }
      else {
    	  route_callbck(null, "Password incorrect");
      }
    }
  });
};

var createaccount = function(username, password, fullname, route_callbck){
	  console.log('Trying to create account: ' + username);	
	  var value = JSON.stringify({"password": password, "fullname": fullname});
	  userKVS.get(username, function (err, data) {
	    if (err) {
	      route_callbck(null, "sign up error: "+err);
	    } else if (data === null) {
	    	userKVS.put(username, value, function (err, data) {
	    		if (err) {
	    			route_callbck(null, "sign up error: "+err);
	    		} else {
	    			route_callbck({ "username" : username }, null);
	    		}
	    	});
	    } else {
	      route_callbck(null, "A user with this username already exists");
	    }
	  });
};


var database = { 
  verifylogin: verifylogin,
  createaccount: createaccount,
};
                                        
module.exports = database;
                                        
