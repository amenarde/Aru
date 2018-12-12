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
app.get('/newsfeed', newsfeedController.open);
app.get('/getFeedFor', newsfeedController.getFeedFor);
app.post('/postStatusUpdate', wallController.newStatusUpdate);
app.post('/verify', accountController.verify);
app.post('/create', accountController.create);
app.get('/logout', accountController.logout);
app.post('/createchat', chatController.createChat);
app.post('/fetchchat', chatController.fetchChat);
app.post('/postmessage', chatController.postMessage);
app.get('/chat', chatController.open);
app.get('/user/:username', wallController.openProfile);
app.post('/getchats', chatController.getChatUsersByUser)

// app.get('/test', accountController.updateFirstName);
// app.get('/test2', accountController.issueFriendRequest);
// app.get('/test3', accountController.acceptFriendRequest);
// app.get('/test4', accountController.openProfile);
// app.get('/test5', newsfeedController.getFeedFor);

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




