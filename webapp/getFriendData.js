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

    function dumpUsers(callback) {
        schema.Users.scan().loadAll().exec(callback);
    }



// Get data
var getData = function() {
    // Get Information from Database
    // Friendships
    // User2Affiliations
    // Affiliations2User
    // Interests2Users
    // Users2Interests
    let actions = ["friends", "U2I", "I2U", "USERS"];
    let filePath = './recommender/input.txt';
    fs.unlinkSync(filePath);
    var file = fs.createWriteStream(filePath);
    file.on('error', function(err) { /* error handling */ });

    // Loop through each of the databases to pull from
    async.each(actions, function(action, completed) {
        switch(action) {
            case "friends":
                // Dump friends database into a file, also upload all friends into an input file
                dumpFriends(function(err, values) {
                    if (err) {
                        console.log("Could not pull friendships!\n" + err);
                    } else if (values) {
                        var friendsFile = fs.createWriteStream("recommender/existingFriends.txt");
                        values.Items.forEach(function(v) {
                            file.write(v.attrs.user1.replace(/ /g,"_") + "\t" + v.attrs.user2.replace(/ /g,"_") + " 1\n");
                            friendsFile.write(v.attrs.user1.replace(/ /g,"_") + "\t" + v.attrs.user2.replace(/ /g,"_") + "\n");
                        });
                    } else {
                        console.log("No Friendship data!");
                    }
                    completed(err);
                });
                break;
            case "USERS":
                // Dump users database into a file
                dumpUsers(function(err, values) {
                    if (err) {
                        console.log("Could not pull friendships!\n" + err);
                    } else if (values) {
                        var friendsFile = fs.createWriteStream("recommender/existingUsers.txt");
                        values.Items.forEach(function(v) {
                            friendsFile.write(v.attrs.username.replace(/ /g,"_") + "\n");
                            file.write(v.attrs.affiliation.replace(/ /g,"_") + "\t" + v.attrs.username.replace(/ /g,"_") + " 0.5\n");
                            file.write(v.attrs.username.replace(/ /g,"_") + "\t" + v.attrs.affiliation.replace(/ /g,"_") + " 0.5\n");
                        });
                    } else {
                        console.log("No Friendship data!");
                    }
                    completed(err);
                });
                break;
            case "A2U":
                // Dump affiliations and users into a file for input
                dumpA2U(function(err, values) {
                    if (err) {
                        console.log("Could not pull affiliations!\n" + err);
                    } else if (values) {
                        values.Items.forEach(function(v) {
                            // Duplicate so have edges in and out of the node (otherwise affiliations would collect all weight)
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
                // Dump interests per user into input file
                dumpU2I(function(err, values) {
                    if (err) {
                        console.log("Could not pull users 2 interests!\n" + err);
                    } else if (values) {
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
                // Dump interests into an input file
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


