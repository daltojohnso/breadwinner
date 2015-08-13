'use strict';

var http = require('http'),
    express = require('express'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var app = module.exports = express(),
    server = http.createServer(app);




// serialize and deserialize
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(id, done) {
    done(null, id);
    //db not set up... faking until then.
    //done(null, {name: 'Dalton'});
});

passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID ,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://127.0.0.1:3000/auth/google/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's Google profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Google account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }
));

//app.set('view engine', 'ejs');
//app.set('views', __dirname + '/views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'my_precious',
    resave: true,
    saveUninitialized: true}));
app.use(express.static(__dirname + '/public'));

app.use(passport.initialize());
app.use(passport.session());


app.get('/auth/google',
    passport.authenticate('google', { scope: 'openid' }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        // Successful authentication, redirect home.
        console.log('!!!!!!!!!!!!!!success!!!!!!!!!!!!!!!');
        console.log(req.user);
        res.redirect('/');
    }
);

 app.get('/', function(req, res) {
    res.locals.user = 'Dalton';
    res.redirect('/index.html');
 });

app.get('/user', function(req, res) {
    if (req.user) {
        console.log(req.user);
        res.send({user: req.user.displayName});
    } else {
        res.send({user: undefined});
    }

});

 server.listen(3000);
 console.log('Express server listening on port %d in %s mode',
    server.address().port, app.settings.env);