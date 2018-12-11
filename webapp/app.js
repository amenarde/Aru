var express = require('express');
var accountController = require('./controllers/accountController.js');
var newsfeedController = require('./controllers/newsfeedController.js');
var vogels = require('vogels');

var app = express();

app.use(express.bodyParser());
app.use(express.logger("default"));
app.use(express.cookieParser());
app.use(express.session({secret: "amenarde"}));
app.use('/css', express.static(__dirname + '/css'));
app.use('/fonts', express.static(__dirname + '/fonts'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));

/* Below we install the routes. The first argument is the URL that we
   are routing, and the second argument is the handler function that
   should be invoked when someone opens that URL. Note the difference
   between app.get and app.post; normal web requests are GETs, but
   POST is often used when submitting web forms ('method="post"'). */

app.get('/', accountController.loginOrSignup);
app.get('/newsfeed', newsfeedController.open);
app.post('/verifyOrCreate', accountController.verifyOrCreate);
app.get('/logout', accountController.logout);

vogels.createTables(function(err) {
    if (err) {
        console.log("Error creating tables for app");
        return;
    }

    /* Run the server */
    app.listen(8080);
    console.log('Server running on port 8080. Now open http://localhost:8080/ in your browser!');
});
