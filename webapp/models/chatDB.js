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

                found = true;
    
                getUsersByChat(chatID, function(usersInChat, err) {
                    async.each(usersInChat, function(username, completed) {
                        if (!users.includes(username)) {
                            found = false;
                        }
                        completed(null);
                    }, function () {
                        // Found a chat that had everyone, so return that one
                        if (found === true) {
                            callback(chatID, null);
                        }
                    });
                });
            }, function () {
    
                chatID = null;
                usernameToSkip = "";
                // Since we didn't find a chat, we make a new one
                // First we tell the chat about the users, putting the person in defines the chatid
                Schema.Chat2User.create({username: users[0]}, function(err, chat) {
                    // Save the newfound chat
                    chatID = chat.get('chatID');
                    usernameToSkip = chat.get('username')
    
                    // Fill out the Chat tables
                    async.each(users, function(username, completed) {
                        if (username != usernameToSkip) {
                            Schema.Chat2User.create({username: username, chatID: chatID}, function(err, chat) {
                                Schema.User2Chat.create({username: username, chatID: chatID}, function(err, chat) {
                                    completed(null);
                                });
                            });
                        }
                        else {
                            Schema.User2Chat.create({username: username, chatID: chatID}, function(err, chat) {
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

        Schema.Chat2User.create({chatID: chatID, username: username}, function(err, chat) {
            Schema.User2Chat.create({chatID: chatID, username: username}, function(err, chat) {
                callback(true, null);
            });
        });
    });
}

function removeUser(chatID, userID) {
    getUsersByChat(chatID, function(users, err) {
        if (users === null) {
            callback(null, "Chat does not exist");
        }

        if (users.includes(username)) {
            callback(null, "User already part of chat");
        }

        Schema.Chat2User.create({chatID: chatID, username: username}, function(err, chat) {
            Schema.User2Chat.create({chatID: chatID, username: username}, function(err, chat) {
                callback(true, null);
            });
        });
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
    })
}

var database = {
    createChat: createChat,
    deleteChat: deleteChat,
    postToChat: postToChat,
    addUser: addUser,
    removeUser: removeUser,
    fetchChat: fetchChat,
    userInChat: userInChat
  };

  module.exports = database;
