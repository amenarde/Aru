var Schema = require('./schemas.js');
var async = require('async');
var userDB = require('./userDB.js');

// Takes in a list of String : username
function createChat(users, callback) {
	async.each(users, function(username) {
         if (!userDB.exists(username)) {
             callback(null, "User does not exist: " + JSON.stringify(user));
         }
    }, function () {
        // Look for chat
        async.each(getChatsByUser(users[0]), function(chatID) {

            found = true;

            getUsersByChat(chatID, function(usersInChat, err) {
                async.each(usersInChat, function(username) {
                    if (!users.contains(username)) {
                        found = false;
                    }
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
                chatID = chat.get('ChatID');
                usernameToSkip = chat.get('username')

                // Fill out the Chat tables
                async.each(users, function(username) {
                    if (username != usernameToSkip) {
                        Schema.Chat2User.create({username: username, chatID: chatID}, function(err, chat) {});
                    }
                    Schema.User2Chat.create({username: username, chatID: chatID}, function(err, chat) {});
                }, function () {
                    callback(chatID, null);
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
    Chat2User.query(chatID).loadAll().exec(function(err, chats){
        users = [];
            // Add usernames to users, return
            async.each(chats, function(chat) {
                users.push(chats.get('username'));
            }, function () {
                callback(users, null);
            });
    });
}

function fetchChat(chatID, callback) {
    ChatData.query(chatID).loadAll().exec(function(err, chats){
        callback(chats);
    });
}

function getChatsByUser(username, callback) {
    User2Chat.query(username).loadAll().exec(function(err, users){
        chats = [];
            // Add usernames to users, return
            async.each(users, function(user) {
                chats.push(user.get('chatID'));
            }, function () {
                callback(chats, null);
            });
    });
}

var database = {
    createChat: createChat,
    deleteChat: deleteChat,
    postToChat: postToChat,
    addUser: addUser,
    removeUser: removeUser,
    fetchChat: fetchChat
  };

  module.exports = database;
