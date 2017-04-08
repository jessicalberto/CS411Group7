//This is the list of all the packages/plugins we've installed thus far.
const express = require("express");
const app = express();
const bodyParser=require('body-parser');
const yelp = require('yelp-fusion');
const passport = require('passport');
const mongoose = require('mongoose');
var Strategy = require('passport-twitter').Strategy;


//This is the block of code that enables us to connect mongoose to our database
//We're using the built-in .connect method and the URL given from MLAB (which is a free mongoDB database)
//URL was provided by Mlab, but in short, just username + password + everything else
mongoose.connect('mongodb://yishan:dosequis@ds161029.mlab.com:61029/usersweightdrink')
var db = mongoose.connection;

//This sets our "schema", which is how we're setting up the table
//We will likely need multiple schemas (one for users, one for something else)
var Schema = mongoose.Schema;

/*J and I made this schema to fit the assignment, so store the API result from
Yelp based on the search term and location.  That way, when a user searches for
a term/location (i.e "donuts, Seattle"), if in our database, the queryterm "donuts"
and the querlocation "Seattle" already exists, we just return the results.

If queryterm/querylocation doesn't exist in our database, then we know that
it doesn't exist => make an API call, give the user the results, and then store
these queryterm/querylocation in our database, so the NEXT time someone searches
"Donuts, Seattle", instead of making that API call, we just return the results from
the db.

tl;dr cache

We parsed the API result to display the top 3 restaurants/bars that return what
you're looking for, along with its average star rating and its address.
*/
var resultSchema = new Schema({
  queryterm: String,
  querylocation: String,
  //Restaurant 1
  restaurant1: String,
  rating1: String,
  address1: String,
  photo1: String,
  price1: String,
  //Restaurant 2
  restaurant2: String,
  rating2: String,
  address2: String,
  photo2: String,
  price2: String,
  //Restaurant 3
  restaurant3: String,
  rating3: String,
  address3: String,
  photo3: String,
  price3: String
});

var result = mongoose.model('result', resultSchema);

/*Schemas can take a variety of data types, like Integers, String, Objects
but we are held kind of contingent to the data types that Yelp API returns
(i.e, Yelp returns the rating of each restaurant as a String, not an int)+
Strings seem to be the easiest as of now.
*/


/*LOGIN FOR TWITTER OAUTH PASSPORT */

var keys = require('./config');

//myKey for the API, secretKey for Yelp Secret, consumerKey for Twitter Oauth, secret for Twitter Oauth
var myKey = keys.mykey;
var secretKey= keys.secretkey;
var myconsumerKey = keys.consumerKey;
var myconsumerSecret = keys.consumerSecret;

//Using the npm package of passport/twitter strategy to setup our Twitter oauth, base syntax (lifted & shifted)
passport.use(new Strategy ({
  consumerKey: myconsumerKey,
  consumerSecret: myconsumerSecret,
  callbackURL:'http://localhost:8000/'
  //The callbackURL is what web page twitter redirects the user to after a successful login
},

//More lifting and shifting of the base package syntax, can't really explain well
function(token, tokenSecret, profile, cb) {
  console.log("user made it to this stage of function!");
  return cb(null, profile);
}));

//These are to serialize user sessions once they've logged in as users
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

//More base syntax for the passport twitter package, can't explain well
app.use(require('express-session')({secret: 'placeholder', resave: true, saveUninitialized:true}));

'use strict';

/*Authenticating our Yelp search, first using our stored Yelp keys + secret to retrieve our
token, THEN after successfully obtaining our token, initialize ourselves as a "client" so we
may use the Yelp API.
*/
const token = yelp.accessToken(myKey, secretKey).then(response => {
  const client = yelp.client(response.jsonBody.access_token);

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
  /*Just keeping these as a reference for if trying to understand how EJS works.  EJS
  is essentially HTML with embedded JS, which enables us to take in dynamic data and do
  cool stuff to it with HTML.  Otherwise, with just HTML, everything is static and there
  would be no way AFAIK to pass our back-end data results to the front-end.

  Visit /embeddedtest to see how it works.
  */
  app.get("/embeddedtest", function(req, res) {

    var drinks = [
      {name: "Blood Mary"},
      {name: "Martini"},
      {name: "Scotch"}
    ];

    //Using .render instead of .sendFile or .send because of static HTML constraints
    res.render(__dirname + "/views/test.ejs", {
      drinks: drinks,
    });
  });


  //This is the back-end code for when the user clicks on the "Submit" button
  app.get("/yelpresult", function(req, res) {

    //Here, we're just console.logging in Terminal as a way of verifiying we're taking in the inputs correctly
    console.log("SEARCH = " + req.query.search);
    console.log("LOCATION = " + req.query.location);

    /*The way this logic here works is with a standard if, else.  First we're saying, go to our database in mongodb
    that we set up earlier, look up if the queryterm/querylocation already exist using the mongodb built-in Node
    method of .find.

    IF db.collection("results").find() returns nothing from our database, that means it DOESN'T EXIST => call the API result,
    return those results to user, and then STORE them in the database.

    ELSE if db.collection("results").find() returns something in our database, that means that that an entry exists already for
    the search term/search location. Since the entry already exists, we just return the result from our database, no need for API call.
    */

    db.collection("results").find( {queryterm: req.query.search, querylocation: req.query.location}).toArray(function(err, result) {
      if (result != "") {
        console.log("Found!  An entry for THIS query already exists in database.");
        res.render(__dirname + "/views/test2.ejs", {result});
        console.log(result);
      }

      else {

        console.log("IT DOESN'T EXIST!  CALLING YELP API");

        client.search({
          term: req.query.search,
          location: req.query.location
        }).then (response => {
          console.log(response.jsonBody.businesses[0].name);
          var tophit = response.jsonBody.businesses[0].name;
          var biz_id = response.jsonBody.businesses[0].id;

          console.log("***FIRST THREE RESULTS***");
          
          //This variable is just to consolidate/simplify response.jsonBody every time
          var setresp = response.jsonBody;

          console.log("**Query search = " + req.query.search);
          console.log("**Query location = " + req.query.location);

          console.log("Name 1: " + setresp.businesses[0].name);
          console.log("Rating: " + setresp.businesses[0].rating);
          console.log("Location: " + setresp.businesses[0].location);
          console.log("Price Level: " + setresp.businesses[0].price);

          // Storing the data/results from the first result (RESTAURANT/BAR 1)
          var result1 = " Name: " + setresp.businesses[0].name;
          var rate1 = " Rating: " + setresp.businesses[0].rating;
          var location1 = " Location: " + setresp.businesses[0].location.display_address;
          var priceRange1 = "Price Level: " + setresp.businesses[0].price;
          var image1 = setresp.businesses[0].image_url;

          // Storing the data/results from the first result (RESTAURANT/BAR 2)
          var result2 = " Name: " + setresp.businesses[1].name;
          var rate2 = " Rating: " + setresp.businesses[1].rating;
          var location2 = " Location: " + setresp.businesses[1].location.display_address;
          var priceRange2 = "Price Level: " + setresp.businesses[1].price;
          var image2 = setresp.businesses[1].image_url;

          // Storing the data/results from the first result (RESTAURANT/BAR 3)
          var result3 = " Name: " + setresp.businesses[2].name;
          var rate3 = " Rating: " + setresp.businesses[2].rating;
          var location3 = " Location: " + setresp.businesses[2].location.display_address;
          var priceRange3 = "Price Level: " + setresp.businesses[2].price;
          var image3 = setresp.businesses[2].image_url;

          /*This is the built-in method for inserting things into our database.  So since we
          have already parsed our results from the API result into its own variable, we can just
          push these/store these in the database based on our resultSchema from earlier.

          MongoDB itself has collections and each collection is its own "database".  So eventually
          we will likely have another db.collection but instead of db.collection("results"), it'd
          probably hvae to be db.collection("users"), which will have a different schema based on what
          we set earlier.
          */
          db.collection("results").insert({
            // Restaurant 1
            queryterm: req.query.search,
            querylocation: req.query.location,
            restaurant1: result1,
            rating1: rate1,
            address1: location1,
            photo1: image1,
            price1: priceRange1,

            //Restaurant 2
            restaurant2: result2,
            rating2: rate2,
            address2: location2,
            photo2: image2,
            price2: priceRange2,

            //Restaurant 3
            restaurant3: result3,
            rating3: rate3,
            address3: location3,
            photo3: image3,
            price3: priceRange3
          });

          //Logging to confirm that the insertion in db is successful.
          console.log("INSERT SUCCESSFUL");

          //Thus, render this new page, test.ejs, and pass in all these data vars so that we may display
          //them on the front end
          res.render(__dirname + "/views/test.ejs", { result1,rate1,location1, image1,priceRange1,result2,rate2,location2,image2,priceRange2,result3,rate3,location3, image3,priceRange3});

          //Currently not doing anything with reviews, this is just a block of code just to play around with,
          //but it currently doesn't do anything.
          client.reviews(biz_id).then (response => {
            var biz_reviews = response.jsonBody.reviews;

          })

        })

      }

    })

  });

});
