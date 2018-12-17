var schema = require('./models/schemas.js');
var async = require('async');

const fs = require('fs');
var lineReader = require('line-reader');

var uploadData = function() {
    // Empty database


    let filePath = "recommender/part-r-00000";
    var file = fs.createReadStream(filePath);
    file.on('error', function(err) { console.log("File error: " + err);});
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(filePath)
    });
      
    lineReader.on('line', function (line) {
        if (line) {
            let parts = line.split("\t");
            if (parts.length != 2) {
                console.log("Invalid line: " + line);
            } else {
                // Check if were already friends
                let user2AndWeight = parts[1].split(" ");
                checkUserStatus(parts[0], user2AndWeight[0], function(isUser1, isUser2, areFriends, err) {
                    if (!areFriends && isUser1 && isUser2) {
                        schema.RecommendedFriends.create({user1: parts[0], user2: user2AndWeight[0], strength: user2AndWeight[1]}, function(err, newRec) {
                            if (err) {
                                console.log(err);
                            }
                        });
                        console.log("New friendship " + line);
                    } else {
                        console.log("Not a valid recommendation");
                    }
                });
                
            }
        } else {
            console.log("Invalid line: " + line);
        }
    });
}

var checkUserStatus = function(user1, user2, callback) {
    let isUser1 = false;
    let isUser2 = false;
    let alreadyFriends = false;
    lineReader.eachLine('recommender/existingFriends.txt', function(line, last) {
        if (line) {
            let parts = line.split("\t");
            if (parts.length != 2) {
            } else {
                if (parts[0] === user1 && parts[2] === user2) {
                    alreadyFriends = true;
                    callback(isUser1, isUser2, alreadyFriends, null);
                    return false;
                } else if (parts[0] === user1 || parts[1] === user1) {
                    isUser1 = true;
                } else if (parts[0] === user2 || parts[1] === user2) {
                    isUser2 = true;
                } 
            } 
        }

        if (last) {
            callback(isUser1, isUser2, alreadyFriends, null);
            return false;
        }
    });
}

console.log("Starting upload...");
uploadData();


