var vogels = require('vogels');
vogels.AWS.config.loadFromPath('config.json');
var schema = require('./models/schemas.js');
var async = require('async');

const fs = require('fs');

// Get Information from Database
    // Friendships
    function dumpFriends(callback) {
        schema.Friendships.scan().loadAll().exec(callback);
    }
    // User2Affiliations
    function dumpA2U(callback) {
        schema.Affiliations.scan().loadAll().exec(callback);
    }
    // Affiliations2User
    
    // Interests2Users
    function dumpI2U(callback) {
        schema.Interests2User.scan().loadAll().exec(callback);
    }
    // Users2Interests
    function dumpU2I(callback) {
        schema.User2Interests.scan().loadAll().exec(callback);
    }



// Get data
var getData = function() {
    // Get Information from Database
    // Friendships
    // User2Affiliations
    // Affiliations2User
    // Interests2Users
    // Users2Interests
    let actions = ["friends", "A2U", "U2I", "I2U"];
    let filePath = './input.txt';
    fs.unlinkSync(filePath);
    var file = fs.createWriteStream(filePath);
    file.on('error', function(err) { /* error handling */ });
    async.each(actions, function(action, completed) {
        switch(action) {
            case "friends":
                dumpFriends(function(err, values) {
                    if (err) {
                        console.log("Could not pull friendships!\n" + err);
                    } else if (values) {
                        // console.log("Friendship values: ");
                        // console.log(values);
                        values.Items.forEach(function(v) {
                            file.write(v.attrs.user1.replace(/ /g,"_") + "\t" + v.attrs.user2.replace(/ /g,"_") + " 1\n");
                        });
                    } else {
                        console.log("No Friendship data!");
                    }
                    completed(err);
                });
                break;
            case "A2U":
                dumpA2U(function(err, values) {
                    if (err) {
                        console.log("Could not pull affiliations!\n" + err);
                    } else if (values) {
                        console.log("Affiliation values: ");
                        console.log(values);
                        values.Items.forEach(function(v) {
                            file.write(v.attrs.affiliation.replace(/ /g,"_") + "\t" + v.attrs.username.replace(/ /g,"_") + " 0.5\n");
                            file.write(v.attrs.username.replace(/ /g,"_") + "\t" + v.attrs.affiliation.replace(/ /g,"_") + " 0.5\n");
                        });
                    } else {
                        console.log("No affiliation data!");
                    }
                    completed(err);
                });
                break;
            case "U2I":
                dumpU2I(function(err, values) {
                    if (err) {
                        console.log("Could not pull users 2 interests!\n" + err);
                    } else if (values) {
                        // console.log("values: ");
                        // console.log(values);
                        values.Items.forEach(function(v) {
                            file.write(v.attrs.username.replace(/ /g,"_") + "\t" + v.attrs.interest.replace(/ /g,"_") + " 0.2\n");
                        });
                    } else {
                        console.log("No u2i data!");
                    }
                    completed(err);
                });
                break;
            case "I2U":
                dumpI2U(function(err, values) {
                    if (err) {
                        console.log("Could not pull interests 2 users!\n" + err);
                    } else if (values) {
                        
                        values.Items.forEach(function(v) {
                            file.write(v.attrs.interest.replace(/ /g,"_") + "\t" + v.attrs.username.replace(/ /g,"_") + " 0.2\n");
                        });
                    } else {
                        console.log("No i2u data!");
                    }
                    completed(err);
                });
                break;
        }
    }, function(err) {
        console.log("Done!");
        // Close file
        file.end();
    });
}

console.log("Running!");
getData();

