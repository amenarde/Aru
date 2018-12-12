
var chatDB = require('../models/chatDB.js');

var open = function(req, res) {
	if (!req.session.account) {
		res.render('main.ejs', {error: "You must be logged in to see that page."});
		return;
	}

	res.render('chat.ejs');
}

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

function fetchChat(req, res) {
	if (!req.session.account) {
		res.render('main.ejs', {error: "You must be logged in to see that page."});
		return;
	}

	var chatID = req.body.chatID;

	chatDB.userInChat(req.session.account, chatID, function(data, err) {
		if(data === true) {
			chatDB.fetchChat(chatID, function(data, err) {
				res.send({chats: data});
			});
		}
	});
}

function deleteChat(chatID) {
	
}

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

function addUser(chatID, userID) {
	// If was a 2 person chat, make a new chat
}

function removeUser(chatID, userID) {
	// Check whether or not to delete chat if empty
}

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
	  });
}

var routes = {
	createChat: createChat,
	fetchChat: fetchChat,
	postMessage: postToChat,
	open: open,
	socket: socketFunc
  };
  
  module.exports = routes;
