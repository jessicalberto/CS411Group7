const express = require("express");
const app = express();
const bodyParser=require('body-parser');

console.log("App is up and running!");

app.listen(8000, function() {
  console.log("Running and listening on PORT 8000");
})

app.get("/", function(req, res) {
  console.log("User requesting/landing on homepage.");
  res.sendFile(__dirname + "/views/home.html");
});

/*app.get("/apiresult", function(req, res) {
  console.log("Returning the API results.");
  res.send(req.query);
});*/
