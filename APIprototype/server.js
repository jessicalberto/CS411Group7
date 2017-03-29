const express = require("express");
const app = express();
const bodyParser=require('body-parser');
const yelp = require('yelp-fusion');
const passport = require('passport');
var Strategy = require('passport-twitter').Strategy;

/*LOGIN FOR TWITTER OAUTH PASSPORT */

var keys = require('./config');

var myKey = keys.mykey;
var secretKey= keys.secretkey;
//var myconsumerKey = keys.twitterkey;
//var myconsumerSecret = keys.twittersecret;

//Using the npm package of passport/twitter strategy to setup our Twitter oauth

passport.use(new Strategy ({
  consumerKey: "help",
  consumerSecret: "jessica",
  callbackURL:'http://localhost:8000/' //this represents the callback URL after successful oauth, where twitter redirects the user to
},//not so sure about shit below ,but it works
  function(token, tokenSecret, profile, cb) {
    console.log("user made it to this stage of function!");
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(require('express-session')({secret: 'placeholder', resave: true, saveUninitialized:true}));

'use strict';

//Authentication for Yelp API below

const token = yelp.accessToken(myKey, secretKey).then(response => {
const client = yelp.client(response.jsonBody.access_token);

//Basic web app startup and routing

console.log("App is up and running!");

//Listens on port 8000 for a request

app.listen(8000, function() {
  console.log("Running and listening on PORT 8000");
})

//Sets the route for the home page, logs once in terminal msg, sendFiles of our home.html

app.get("/", function(req, res) {
  console.log("User requesting/landing on homepage.");
  res.sendFile(__dirname + "/views/home.html");
});

//Initializes a session needed for our Twitter oauth

app.use(passport.initialize());
app.use(passport.session());

//Sets the page that links to the loginto twitter authentication page

app.get("/login/twitter",
  passport.authenticate('twitter'));

//This is the Yelp API result after user fills out form and submits query

app.get("/yelpresult", function(req, res) {
  console.log("SEARCH = " + req.query.search);
  console.log("LOCATION = " + req.query.location);

    client.search({
      term: req.query.search,
      location: req.query.location
    }).then (response => {
      console.log(response.jsonBody.businesses[0].name);
      var tophit = response.jsonBody.businesses[0].name;
      var biz_id = response.jsonBody.businesses[0].id;

      //we're sending just back to first business that we get with the result with all the params
      res.send(response.jsonBody.businesses[0]);

    client.reviews(biz_id).then (response => {
      console.log(response.jsonBody.reviews);
      //playing around with sending back reviews, couldn't get them to go together so w/e for this round
      var biz_reviews = response.jsonBody.reviews;

    })

    })

  })



});
