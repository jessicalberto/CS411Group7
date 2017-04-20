# CS411Group7
CS 411 - Group 7 Project - Website Application

This is Group 7's GitHub repository for our final project. 

Our website application will be any college kid’s ideal, all-inclusive app for a night out. Ideally, the site will have a selection page for the user to pick how drunk he or she would like to get that night: ranging from buzzed, drunk, very drunk, black-out, or not drunk at all. Based on that selection, the website will then display certain drinks and quantities that would be best for the user to achieve the desired level of drunkenness, plus a potential cost the user will spend that night based on the drinks they choose. (costs drawn from local grocery stores, Target API, etc.) After this, the user will be able to enter their location. At a high level, we then draw from the google map APIs which show bars in a 0.5 mile - 1 mile radius of the route between the two points. We then look at the bars generated and use the google data for most popular hours, and a Yelp API to get data for which bars are the busiest and most favorably review. We then output the bar route that would be most optimal for a bar crawl. 

Notes: 
master branch -- final demonstration development <br/>
APIbranch -- API developer branch <br/>
flaskExample -- Data developer branch <br/>
  --> to run flaskExample
  --> requirements.txt coming soon~ 
  --> start mongo: sudo mongod
  --> python2 run2.py

