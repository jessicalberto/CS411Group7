const express = require("express");
const app = express();
const bodyParser=require('body-parser');
const yelp = require('yelp-fusion');
const passport = require('passport');

const mongoose = require('mongoose');

mongoose.connect('mongodb://yishan:password@ds161029.mlab.com:61029/usersweightdrink')
var db = mongoose.connection;

var Schema = mongoose.Schema;
var resultSchema = new Schema({
  queryterm: String,
  querylocation: String,
  resultlist: String
});

var result = mongoose.model('result', resultSchema);

var Strategy = require('passport-twitter').Strategy;

/*LOGIN FOR TWITTER OAUTH PASSPORT */

var keys = require('./config');

var myKey = keys.mykey;
var secretKey= keys.secretkey;
var myconsumerKey = keys.consumerKey;
var myconsumerSecret = keys.consumerSecret;

//Using the npm package of passport/twitter strategy to setup our Twitter oauth

passport.use(new Strategy ({
  consumerKey: myconsumerKey,
  consumerSecret: myconsumerSecret,
  callbackURL:'http://localhost:8000/'
//this represents the callback URL after successful oauth, where twitter redirects the user to
},

//not so sure about shit below ,but it works
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

//These are just my tests (Yishan)'s for embedded JS when we return data to front end

app.get("/embeddedtest", function(req, res) {

  var drinks = [
    {name: "Blood Mary"},
    {name: "Martini"},
    {name: "Scotch"}
  ];

  res.render(__dirname + "/views/test.ejs", {
    drinks: drinks,
  });
});


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


      console.log("***FIRST THREE BUSINESS RESULTS***");
      //console.log(response.jsonBody.businesses);
      //console.log("# of businesses: " + response.jsonBody.total);
      //we're sending just back to first business that we get with the result with all the params

      //for formatting purposes, beats repeating shit every time
      var setresp = response.jsonBody;

      console.log("**Query search = " + req.query.search);
      console.log("**Query location = " + req.query.location);
      console.log("Name 1: " + setresp.businesses[0].name);
      console.log("Rating: " + setresp.businesses[0].rating);
      console.log("Location: " + setresp.businesses[0].location.address1);
      console.log("Price Level: " + setresp.businesses[0].price);

      var businessarray = new Array();
      businessarray.push(req.query.search);
      businessarray.push(req.query.location);

      var resultbody = "Name: " + setresp.businesses[0].name + " Rating: " + setresp.businesses[0].rating
      + " Address: " + setresp.businesses[0].address1;

      for (x = 1; x <= 2; x++) {

        resultbody = " || Name: " + setresp.businesses[x].name + " Rating: " + setresp.businesses[x].rating
        + " Location: " + setresp.businesses[x].location.address1 + resultbody;

      }

      businessarray.push(resultbody);

      console.log("***resultbody*** = " + resultbody);

      db.collection("results").insert({
        queryterm: req.query.search,
        querylocation: req.query.location,
        resultlist: resultbody,
      });

      //console.log(businessarray);
      res.render(__dirname + "/views/test.ejs", { resultbody});

      //this is working, but just testing EJS
      //res.send(JSON.stringify(business_string));

    client.reviews(biz_id).then (response => {
      //console.log(response.jsonBody.reviews);
      //playing around with sending back reviews, couldn't get them to go together so w/e for this round
      var biz_reviews = response.jsonBody.reviews;

    })

    })

  })



});
