
var chatDB = require('../models/chatDB.js');
var userDB = require('../models/userDB.js');
var async = require('async');

// Chat page
var open = function(req, res) {
	if (!req.session.account) {
		res.render('main.ejs', {error: "You must be logged in to see that page."});
		return;
	}

	res.render('chat.ejs');
}

// Create chat, pass through to DB
var createChat = function (req, res) {
	if (!req.session.account) {
		res.render('main.ejs', {error: "You must be logged in to see that page."});
		return;
	}

	users = [];

	users.push(req.body.username);
	users.push(req.session.account);

	chatDB.createChat(users, function(data, err) {
		if (err) {
			res.send({error: err});
		}
		else {
			res.send({chatid: data});
		}
	});
};

// Gets chat history, good for when first openning a chat window -- only allows people in the chat to access the chat content
function fetchChat(req, res) {
	if (!req.session.account) {
		res.render('main.ejs', {error: "You must be logged in to see that page."});
		return;
	}

	var chatID = req.body.chatID;

	chatDB.userInChat(req.session.account, chatID, function(data, err) {
		if(data === true) {
			chatDB.fetchChat(chatID, function(data, err) {
				var prettyChatName = "";
				chatDB.getChatType(chatID, function(type, err) {
					if (type === 'dm') {
						prettyChatName += "Your direct message with ";
					}
					else {
						prettyChatName += "Your group chat with ";
					}

					chatDB.getUsersByChat(chatID, function(users, err) {
						async.each(users, function(user, completed) {
							prettyChatName += " " + user;
							completed();
						}, function(err) {
							res.send({chats: data, chatTitle: prettyChatName, type: type});
						});
					})
				});
			});
		}
	});
}

// Posts to a chat, makes sure the user is in the chat
function postToChat(req, res) {
	if (!req.session.account) {
		res.render('main.ejs', {error: "You must be logged in to see that page."});
		return;
	}

	var chatID = req.body.chatID;
	var message = req.body.message;

	chatDB.userInChat(req.session.account, chatID, function(data, err) {
		if(data === true) {
			chatDB.postToChat(chatID, req.session.account, message, function(data, err) {
				res.send({success: true});
			});
		}
	});
}

// Discovery to see all the active chats!
function getChatUsersByUser(req, res) {
	if (!req.session.account) {
		res.render('main.ejs', {error: "You must be logged in to see that page."});
		return;
	}

	chatDB.getChatUsersByUser(req.session.account, function(data, err) {

		var chats = [];

		async.each(data, function(chat, completed) {

			var names = [];

			async.each(chat.users, function(person, completed2) {
				userDB.get(person, function(userData, err) {
					if(userData.attrs.username != req.session.account) {
						names.push(userData.attrs.firstName + " " + userData.attrs.lastName);
					}
					completed2(null);
				});
			}, function(err) {

				chatDB.getChatType(chat.chat, function(type, err) {
					chats.push({chat: chat.chat, users: names, type: type});
					completed(null);
				});
			});

		}, function(err) {
			res.send(chats);
		});
	});
}

// Allows users in a chat to add people who aren't in the chat to chat
function addUser(req, res) {
	var askingUser = req.session.account;
	var userToAdd = req.body.username;
	var chatID = req.body.chatID;

	chatDB.userInChat(askingUser, chatID, function(data, err) {
		if (data === true) {
			chatDB.userInChat(userToAdd, chatID, function(data, err) {
				if (data === false) {
					chatDB.addUser(chatID, userToAdd, function(data, err) {
						res.send({chatID: data});
					});
				}
				else {
					res.send({error: "This user is already in this chat."});
				}
			});
		}
		else {
			res.send({error: "You must be in this chat to add a user to it."});
		}
	});
}

function leaveChat(req, res) {
	// Check whether or not to delete chat if empty
}

// Allows sockets to post to DB
function ioPostMessage(username, chatID, message, callback) {
	chatDB.userInChat(username, chatID, function(data, err) {
		if(data === true) {
			chatDB.postToChat(chatID, username, message, function(data, err) {
				if(err) {
					callback(false, err);
				}

				callback(true, null);
			});
		}
	});
}

var activeUsers = [];

// Chat sockets
function socketFunc(io) {
	io.on('connection', (socket) => {
		// when the client emits 'post message', this listens and executes
		socket.on('post message', (data) => {
		  // we tell the client to execute 'new message'
		  ioPostMessage(socket.handshake.session.account, data.chatID, data.message, function(success, err) {
			  if (success === true) {
				  io.in(data.chatID).emit('new message', {
					  username: socket.handshake.session.account,
					  message: data.message
				  });
			  }
		  });
		});

		socket.on('join room', (chatID) => {
		  chatDB.userInChat(socket.handshake.session.account, chatID, function(data, err) {
			  if(data === true) {
				  socket.join(chatID);
			  }
		  });
		});

		socket.on('available to chat', () => {
			socket.emit('username', {username: socket.handshake.session.account});
		});

		socket.on('available to chat', (data) => {
			activeUsers.push(socket.handshake.session.account);
			socket.join('available2chat');

			io.in('available2chat').emit('available', {
				users: activeUsers
			});
		  });

		  socket.on('disconnect', () => {
			var index = activeUsers.indexOf(socket.handshake.session.account);
 			if (index > -1) {
       			activeUsers.splice(index, 1);
			 }

			io.in('available2chat').emit('available', {
				users: activeUsers
			});
		  });

		socket.on('leave', (data) => {
			var leavingUser = socket.handshake.session.account;
			var chatID = data.chatID;

			chatDB.userInChat(leavingUser, chatID, function(data, err) {
				if (data === true) {
					chatDB.removeUser(chatID, leavingUser, function(data, err) {
						// send to all people besides user
						socket.broadcast.to(chatID).emit('remove user', {
							chatID: chatID,
							leavingUser: leavingUser,
						});

						// tell sender to leave
						socket.emit('leave', null);
					});
				}
			});
		});

		socket.on('add user', (data) => {
			var askingUser = socket.handshake.session.account;
			var userToAdd = data.username;
			var chatID = data.chatID;

			chatDB.userInChat(askingUser, chatID, function(data, err) {
				if (data === true) {
					chatDB.userInChat(userToAdd, chatID, function(data, err) {
						if (data === false) {
							chatDB.addUser(chatID, userToAdd, function(data, err) {
								io.in(chatID).emit('add user', {
									chatID: data,
									askingUser: askingUser,
									userToAdd: userToAdd
								});
							});
						}
						else {
							res.send({error: "This user is already in this chat."});
						}
					});
				}
				else {
					res.send({error: "You must be in this chat to add a user to it."});
				}
			});
		});
	  });
}

var routes = {
	createChat: createChat,
	fetchChat: fetchChat,
	postMessage: postToChat,
	open: open,
	socket: socketFunc,
	getChatUsersByUser: getChatUsersByUser,
	addUser: addUser,
	leaveChat: leaveChat
  };

  module.exports = routes;
