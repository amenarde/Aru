var Schema = require('./schemas.js');
var async = require('async');
var userDB = require('./userDB.js');

// Takes in a list of String : username
function createChat(users, callback) {
	async.each(users, function(username, completed) {
        userDB.exists(username, function(data, err) {
            if (data === false) {
                callback(null, "User does not exist: " + username);
            }
            completed(null);
        });
    }, function (err) {
        // Look for chat

        getChatsByUser(users[0], function(data, err) {
            async.each(data, function(chatID, completed) {

                found = false;
    
                getUsersByChat(chatID, function(usersInChat, err) {
                    if (arraysEqual(users, usersInChat)) {
                        found = true;
                        callback(chatID, null);
                        return;
                    }
                    completed(null);
                });
            },function (err) {
    
                chatID = null;
                usernameToSkip = "";
                type = null;
                if (users.length === 2) {
                    type = "dm";
                }
                else {
                    type = "group";
                }
                // Since we didn't find a chat, we make a new one
                // First we tell the chat about the users, putting the person in defines the chatid
                Schema.Chat2User.create({username: users[0], type: type}, function(err, chat) {
                    // Save the newfound chat
                    chatID = chat.get('chatID');
                    usernameToSkip = chat.get('username')
    
                    // Fill out the Chat tables
                    async.each(users, function(username, completed) {
                        if (username != usernameToSkip) {
                            Schema.Chat2User.create({username: username, chatID: chatID, type: type}, function(err, chat) {
                                Schema.User2Chat.create({username: username, chatID: chatID, type: type}, function(err, chat) {
                                    completed(null);
                                });
                            });
                        }
                        else {
                            Schema.User2Chat.create({username: username, chatID: chatID, type: type}, function(err, chat) {
                                completed(null);
                            });
                        }
                    }, function () {
                        callback(chatID, null);
                    });
                });
    
            });
        });
    });
}

function getChatUsersByUser(username, callback) {
    var chats = [];
    
    getChatsByUser(username, function(data, err) {
        async.each(data, function(chatID, completed) {
            getUsersByChat(chatID, function(usersInChat, err) {
                var info = {chat: chatID, users: usersInChat}
                chats.push(info);
                completed(null);
            });
        }, function (err) {
            callback(chats, null);
        });
    });
}

function deleteChat(chatID, callback) {
    getUsersByChat(chatID, function(users, err) {
        if (users.length > 1) {
            callback(null, "Cannot delete a chat with more than one member")
        }

        Schema.User2Chat.destroy(users[0], chatID, function(err) {
            Schema.Chat2User.destroy(chatID, users[0], function(err){
                Schema.ChatData.destroy(chatID, function(err){
                    callback(true, null);
                } );
            } );
        });
    });
}

function postToChat(chatID, username, data, callback) {
    getUsersByChat(chatID, function(users, err) {
        if (users === null) {
            callback(null, "Chat does not exist");
        }

        if (!users.includes(username)) {
            callback(null, "Posting user is not part of chat");
        }

        Schema.ChatData.create({chatID: chatID, username: username, data: data}, function(err, chat) {
            callback(true, null);
        });
    });
}

function addUser(chatID, username, callback) {
    getUsersByChat(chatID, function(users, err) {
        if (users === null) {
            callback(null, "Chat does not exist");
        }

        if (users.includes(username)) {
            callback(null, "User already part of chat");
        }

        getChatType(chatID, function(data, err) {
            if (data === 'dm') {
                getUsersByChat(chatID, function(users, err) {
                    users.push(username);
                    createChat(users, function(chatID, err) {
                        callback(chatID, null);
                    });
                });
            }
            else if (data === 'group') {
                Schema.Chat2User.create({chatID: chatID, username: username}, function(err, chat) {
                    Schema.User2Chat.create({chatID: chatID, username: username}, function(err, chat) {
                        callback(chatID, null);
                    });
                });
            }
        });
    });
}

function removeUser(chatID, username, callback) {
    getUsersByChat(chatID, function(users, err) {
        if (users === null) {
            callback(null, "Chat does not exist");
        }

        if (!users.includes(username)) {
            callback(null, "User not part of chat");
        }

        // Destroy model using hash and range key
        Schema.Chat2User.destroy(chatID, username, function (err) {
            Schema.User2Chat.destroy(username, chatID, function(err) {
                callback(true, null);
            });
        });
    });
}

function getChatType(chatID, callback) {
    Schema.Chat2User.query(chatID).limit(1).exec(function(err, data){

            if (data.Count === 0) {
                callback(null, "Chat does not exist");
                return;
            }

           callback(data.Items[0].attrs.type, null);
    });
}

function getUsersByChat(chatID, callback) {
    Schema.Chat2User.query(chatID).loadAll().exec(function(err, data){
        users = [];

            if (data.Count === 0) {
                callback([], null);
                return;
            }

            async.each(data.Items, function(chat, completed) {
                users.push(chat.attrs.username);
                completed(null); 
            }, function (err) {
                callback(users, null);
            });
    });
}

function fetchChat(chatID, callback) {
    Schema.ChatData.query(chatID).loadAll().exec(function(err, chats){
        callback(chats, null);
    });
}

function getChatsByUser(username, callback) {
    Schema.User2Chat.query(username).loadAll().exec(function(err, data){
        chats = [];
            // Add usernames to users, return
            if (data.Count === 0) {
                callback([], null);
                return;
            }

            async.each(data.Items, function(user, completed) {
                chats.push(user.attrs.chatID);
                completed(null); 
            }, function (err) {
                callback(chats, null);
            });
    });
}

function userInChat(username, chatID, callback) {
    Schema.Chat2User.get(chatID, username, function(err, data) {
        if (data != null) {
            callback(true, null);
        }
        else {
            callback(false, null);
        }
    });
}

// This utility function adapted from
// https://stackoverflow.com/questions/6229197/how-to-know-if-two-arrays-have-the-same-values
function arraysEqual(_arr1, _arr2) {

    if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length)
      return false;

    var arr1 = _arr1.concat().sort();
    var arr2 = _arr2.concat().sort();

    for (var i = 0; i < arr1.length; i++) {

        if (arr1[i] !== arr2[i])
            return false;

    }

    return true;

}


var database = {
    createChat: createChat,
    deleteChat: deleteChat,
    postToChat: postToChat,
    addUser: addUser,
    removeUser: removeUser,
    fetchChat: fetchChat,
    userInChat: userInChat,
    getChatUsersByUser: getChatUsersByUser,
    getChatType: getChatType,
    getUsersByChat: getUsersByChat
  };

  module.exports = database;
