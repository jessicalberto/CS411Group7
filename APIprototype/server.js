const express = require("express");
const app = express();
const bodyParser=require('body-parser');
const yelp = require('yelp-fusion');

var keys = require('./config');

var myKey = keys.mykey;
var secretKey= keys.secretkey;

'use strict';

const token = yelp.accessToken(myKey, secretKey).then(response => {
const client = yelp.client(response.jsonBody.access_token);

console.log("App is up and running!");

app.listen(8000, function() {
  console.log("Running and listening on PORT 8000");
})

app.get("/", function(req, res) {
  console.log("User requesting/landing on homepage.");
  res.sendFile(__dirname + "/views/home.html");
});


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

    var rere = JSON.parse(response);

    })

  })



});
