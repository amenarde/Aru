
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

var routes = {
	createChat: createChat,
	fetchChat: fetchChat,
	postMessage: postToChat,
	open: open
  };
  
  module.exports = routes;
