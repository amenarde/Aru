var express = require('express');
var accountController = require('./controllers/accountController.js');
var chatTest = require('./test/testChatDB.js')

var app = express();

app.use(express.bodyParser());
app.use(express.logger("default"));
app.use(express.cookieParser());
app.use(express.session({secret: "amenarde"}));

/* Below we install the routes. The first argument is the URL that we
   are routing, and the second argument is the handler function that
   should be invoked when someone opens that URL. Note the difference
   between app.get and app.post; normal web requests are GETs, but
   POST is often used when submitting web forms ('method="post"'). */

app.get('/', accountController.login);
app.get('/signup', accountController.signup);
app.post('/verifylogin', accountController.verifylogin);
app.post('/createaccount', accountController.createaccount);
app.get('/logout', accountController.logout);

/* Run the server */

app.listen(8080);
console.log('Server running on port 8080. Now open http://localhost:8080/ in your browser!');
chatTest.test();