var schema = require('./models/schemas.js');
var async = require('async');

const fs = require('fs');

var uploadData = function() {
    let filePath = "part-r-00000";
    var file = fs.createReadStream(filePath);
    file.on('error', function(err) { console.log("File error: " + err);});
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(filePath)
    });
      
    lineReader.on('line', function (line) {
        console.log('Line from file:', line);
        if (line) {
            let parts = line.split("\t");
            if (parts.length != 2) {
                console.log("Invalid line: " + line);
            } else {
                let user2AndWeight = parts[1].split(" ");
                schema.RecommendedFriends.create({user1: parts[0], user2: user2AndWeight[0], strength: user2AndWeight[1]}, {overwrite:false}, function(err, newRec) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        } else {
            console.log("Invalid line: " + line);
        }
    });
    
}

console.log("Starting upload...");
uploadData();


