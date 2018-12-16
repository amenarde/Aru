var express = require('express');
var accountController = require('./controllers/accountController.js');
var newsfeedController = require('./controllers/newsfeedController.js');
var wallController = require('./controllers/wallController.js');
var vogels = require('vogels');
var session = require("express-session")({
    secret: "amenarde",
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");
var app = express();

app.use(express.bodyParser());
app.use(express.logger("default"));
app.use(express.cookieParser());
app.use(session);
app.use('/css', express.static(__dirname + '/css'));
app.use('/fonts', express.static(__dirname + '/fonts'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));


const server = require('http').createServer(app);
const io = require('socket.io')(server);
var chatController = require('./controllers/chatController.js');
var ioController = chatController.socket(io);

app.get('/', accountController.loginOrSignup);

// Chat routes
app.post('/createchat', chatController.createChat);
app.post('/fetchchat', chatController.fetchChat);
app.post('/postmessage', chatController.postMessage);
app.post('/getchats', chatController.getChatUsersByUser);

// Account routes
app.get('/logout', accountController.logout);
app.post('/verify', accountController.verify);
app.post('/create', accountController.create);
app.post('/updateInfo', accountController.updateInfo);
app.post('/updateLastName', accountController.updateLastName);
app.post('/updateFirstName', accountController.updateFirstName);
app.post('/updateBirthday', accountController.updateBirthday);
app.post('/updateAffiliation', accountController.updateAffiliation);

// Wall routes
app.get('/user/:username', wallController.openProfile);

// Newsfeed routes
app.get('/newsfeed', newsfeedController.open);
app.get('/getFeedFor', newsfeedController.getFeedFor);
// app.get('/getFeedSince', newsfeedController.getFeedSince);

// Post Routes
app.get('/chat', chatController.open);
app.post('/postStatusUpdate', wallController.newStatusUpdate);
app.post('/newFriendPost', wallController.newFriendPost);
app.post('/comment', wallController.addComment);

// Friend request routes
app.get('/updateFirstName', accountController.updateFirstName);
app.post('/issueFriendRequest', accountController.issueFriendRequest);
app.post('/acceptFriendRequest', accountController.acceptFriendRequest);
app.get('/getFriendRequests', accountController.getFriendRequests);




// Magical stuff to allow sessions in socket.io
// https://stackoverflow.com/questions/25532692/how-to-share-sessions-with-socket-io-1-x-and-express-4-x
// var sessionMiddleware = session({
//     secret: "andreas",
// });
// io.use(function(socket, next) {
//     sessionMiddleware(socket.request, socket.request.res, next);
// });
// app.use(sessionMiddleware);

server.listen(8080, () => { console.log('Server running on port 8080. Now open http://localhost:8080/ in your browser!'); });

// socket.io stuff
io.use(sharedsession(session, {
    autoSave:true
}));




