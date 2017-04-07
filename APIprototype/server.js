const express = require("express");
const app = express();
const bodyParser=require('body-parser');
const yelp = require('yelp-fusion');
const passport = require('passport');

const mongoose = require('mongoose');

mongoose.connect('mongodb://yishan:dosequis@ds161029.mlab.com:61029/usersweightdrink')
var db = mongoose.connection;

var Schema = mongoose.Schema;
var resultSchema = new Schema({
  queryterm: String,
  querylocation: String,
  //Restaurant 1
  restaurant1: String, 
  rating1: String, 
  address1: String,
  //Restaurant 2
  restaurant2: String, 
  rating2: String, 
  address2: String,
  //Restaurant 3
  restaurant3: String, 
  rating3: String, 
  address3: String
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

   //  var businessarray = new Array();
    //  businessarray.push(req.query.search);
     // businessarray.push(req.query.location);

        // RESTAURANT 1
        var result1 = " Name: " + setresp.businesses[0].name; 
        var rate1 = " Rating: " + setresp.businesses[0].rating;
        var location1 = " Location: " + setresp.businesses[0].location.address1; 

        // RESTAURANT 2
        var result2 = " Name: " + setresp.businesses[1].name; 
        var rate2 = " Rating: " + setresp.businesses[1].rating;
        var location2 = " Location: " + setresp.businesses[1].location.address1; 

        // RESTAURANT 3
        var result3 = " Name: " + setresp.businesses[2].name; 
        var rate3 = " Rating: " + setresp.businesses[2].rating;
        var location3 = " Location: " + setresp.businesses[2].location.address1; 


     // businessarray.push(resultbody);

      //console.log("***resultbody*** = " + resultbody);

      db.collection("results").insert({
        queryterm: req.query.search,
        querylocation: req.query.location,
        restaurant1: result1, 
        rating1: rate1, 
        address1: location1,
        //Restaurant 2
        restaurant2: result2, 
        rating2: rate2, 
        address2: location2,
        //Restaurant 3
        restaurant3: result3, 
        rating3: rate3, 
        address3: location3


      });

      console.log("INSERT SUCCESSFUL");
      //console.log(businessarray);
      //res.render(__dirname + "/views/test.ejs", { });

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
