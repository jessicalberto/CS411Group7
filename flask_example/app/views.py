#!/usr/bin/python
from flask import Flask, Response, render_template, redirect, url_for, send_from_directory, session
from app import app
import argparse
import json
import pprint
import sys
import urllib
import requests
import os
from urllib import quote
from urllib import urlencode


#for login
from flask_wtf import Form
from wtforms import StringField, BooleanField
from wtforms.validators import DataRequired
from flask import render_template, flash, redirect
from app import app
from .forms import LoginForm
from flask_oauth import OAuth
from flask_googlemaps import GoogleMaps
from flask_googlemaps import Map

#from urllib.parse import quote
#from urllib.parse import urlencode

from pymongo import MongoClient
client = MongoClient('localhost', 27017)
# make a database called saved
db = client.saved
# yelp search database
saved_search = db.saved
# user names database
#users = db.users

class LoginForm(Form):
    username = StringField('username', validators=[DataRequired()])
    password = StringField('password', validators=[DataRequired()])
    remember_me = BooleanField('remember_me', default=False)

class SearchForm(Form):
    search_term = StringField('name', validators=[DataRequired()])
    location = StringField('location', validators=[DataRequired()])

class RegisterForm(Form):
    username = StringField('username', validators=[DataRequired()])
    password = StringField('password', validators=[DataRequired()])
    email = StringField('email', validators=[DataRequired()])

# API constants, you shouldn't have to change these.
API_HOST = 'https://api.yelp.com'
SEARCH_PATH = '/v3/businesses/search'
BUSINESS_PATH = '/v3/businesses/'  # Business ID will come after slash.
TOKEN_PATH = '/oauth2/token'
GRANT_TYPE = 'client_credentials'

CLIENT_ID = app.config['CLIENT_ID']
CLIENT_SECRET = app.config['CLIENT_SECRET']

GOOGLEMAPS_KEY = app.config['GOOGLEMAPS_KEY']

FACEBOOK_APP_ID = app.config["FACEBOOK_APP_ID"]
FACEBOOK_APP_SECRET = app.config["FACEBOOK_APP_SECRET"]

SEARCH_LIMIT = 5
oauth = OAuth()
facebook = oauth.remote_app('facebook',
    base_url='https://graph.facebook.com/',
    request_token_url=None,
    access_token_url='/oauth/access_token',
    authorize_url='https://www.facebook.com/dialog/oauth',
    consumer_key=FACEBOOK_APP_ID,
    consumer_secret= FACEBOOK_APP_SECRET,
    request_token_params={'scope': 'email'}
)

@app.route('/')
@app.route('/index')

def index():
    return render_template('index.html',
                            title='Home')

@app.route('/search', methods=['GET','POST'])
def search():
     form = SearchForm()
     # in the database
     if form.validate_on_submit():

         search_term = form.search_term.data
         location = form.location.data
         x_results = saved_search.find_one({"search":search_term})
         if(x_results):
             print("already in the database")
             return render_template('results.html',
                            search_term = search_term,
                            results = x_results)
         else:
            print("not in the database yet")
            results = query_api(search_term, location)#query_api(search_term, location)
            new_post = {"search": search_term,
                            "rest1":results[1],
                            "rest2": results[2],
                            "rest3": results[3],
                            "rest4": results[4]}
            saved_search.insert(new_post)#.inserted_id
            ##zz = saved_search.find_one({"search": search_term})
            return render_template('index.html',
                            search_term = search_term,
                            results = results)

     return render_template('search.html',
                            title='Search',
                            form = form)


# index view function suppressed for brevity
@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        find_user = users.find_one({"username":username})
        if(find_user):
            print("user already registed in the database")
            return redirect(url_for("facebook_login"))

        else:
            print("user name not in the database yet")
            return "<a href='/login'>Try again</a>\
                    </br><a href='/register'>or make an account</a>"

    return render_template('login.html',
                           title='Sign In',
                           form=form)

@app.route("/register", methods=['GET','POST'])
def register_user():
    form = RegisterForm()
    username = form.username.data
    password = form.password.data
    email = form.email.data
    test =  isEmailUnique(email)
    if test:
        new_post = {
            "username":username,
            "password":password,
            "email": email
        }
        users.insert_one(new_post).inserted_id
        return redirect(url_for("facebook_login"))
    else:
        print("couldn't find all tokens")
        return render_template('register.html',
                                title='Register',
                                form = form)

    return render_template('register.html',
                            title='Register',
                            form = form)

def isEmailUnique(email):
    #use this to check if a email has already been registered
    find_user = users.find_one({"email":email})
    if find_user:
        #this means there are greater than zero entries with that email
        return False
    else:
        return True

# facebook stuff
@facebook.tokengetter
def get_facebook_token():
    return session.get('facebook_token')

def pop_login_session():
    session.pop('logged_in', None)
    session.pop('facebook_token', None)

@app.route("/facebook_login")
def facebook_login():
    return facebook.authorize(callback=url_for('/facebook_authorized',next=request.args.get('next'), _external=True))

@app.route("/facebook_authorized")
@facebook.authorized_handler
def facebook_authorized(resp):
    next_url = request.args.get('next') or url_for('index')
    if resp is None or 'access_token' not in resp:
        return redirect(next_url)
    session['logged_in'] = True
    session['facebook_token'] = (resp['access_token'], '')

    return  redirect(flask.url_for('mapview'))
    #return flaskredirect(next_url,user_picture_url = get_facebook_profile_url(), user_info = getUserInfoFromId(uid))

@app.route("/logout_facebooklogin")
def logout_facebook():
    pop_login_session()
    return render_template('home_page_template.html', message="Logged out")

#Querying information from facebook
def get_facebook_name():
	data = facebook.get('/me').data
	print(data)
	if 'id' in data and 'name' in data:
		user_id = data['id']
		user_name = data['name']
		return user_name

def get_facebook_friend_appuser():
	data = facebook.get('/me?fields=friends{first_name,last_name}').data
	print(data)
	return data


def get_facebook_profile_url():
    data = facebook.get('/me?fields=picture{url}').data
    if 'picture' in data:
        print(data['picture'])
        json_str = json.dumps(data['picture'])
        resp = json.loads(json_str)
        print("json object")
        user_picture_url = data['picture']
        return data['picture']['data']['url']


## google maps
GoogleMaps(app)
#google map testing
@app.route("/mapview")
def mapview():
    #u_fname=request.form.get('u_fname')
    return render_template('maptest.html')

@app.route("/map_unsafe")
def map_unsafe():
    return render_template('maptest.html')

# getting coordinates back from the map marker the user placed
@app.route("/data_googlemaps")
def data():
    lat_ = request.args.get("lat")
    long_ = request.args.get("lng")
    print("latitude is" +lat_)
    print("long is " + long_)

## yelp functionality

def obtain_bearer_token(host, path):
    """Given a bearer token, send a GET request to the API.
    """
    url = '{0}{1}'.format(host, quote(path.encode('utf8')))
    #assert CLIENT_ID, "Please supply your client_id."
    #assert CLIENT_SECRET, "Please supply your client_secret."
    data = urlencode({
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': GRANT_TYPE,
    })
    headers = {
        'content-type': 'application/x-www-form-urlencoded',
    }
    response = requests.request('POST', url, data=data, headers=headers)
    bearer_token = response.json()['access_token']
    return bearer_token

def request(host, path, bearer_token, url_params=None):

    url_params = url_params or {}
    url = '{0}{1}'.format(host, quote(path.encode('utf8')))
    headers = {
        'Authorization': 'Bearer %s' % bearer_token,
    }

    print(u'Querying {0} ...'.format(url))

    response = requests.request('GET', url, headers=headers, params=url_params)

    return response.json()

def search(bearer_token, term, location):

    url_params = {
        'term': term.replace(' ', '+'),
        'location': location.replace(' ', '+'),
        'limit': SEARCH_LIMIT
    }
    return request(API_HOST, SEARCH_PATH, bearer_token, url_params=url_params)

def get_business(bearer_token, business_id):

    """Query the Business API by a business ID.
    Args:
        business_id (str): The ID of the business to query.
    Returns:
        dict: The JSON response from the request.
    """
    business_path = BUSINESS_PATH + business_id

    return request(API_HOST, business_path, bearer_token)

def query_api(term, location):

    bearer_token = obtain_bearer_token(API_HOST, TOKEN_PATH)

    response = search(bearer_token, term, location)

    businesses = response.get('businesses')

    if not businesses:
        x = (u'No businesses for {0} in {1} found.'.format(term, location))
        return x

    business_id = businesses[0]['id']

    array_ret = [None]*SEARCH_LIMIT

    for i in range(SEARCH_LIMIT):

        business_id = businesses[i]['id']
        business_name = businesses[i]['name']
        business_pic = businesses[i]['image_url']
        business_price = businesses[i]['price']
        business_rating = businesses[i]['rating']

        array_ret[i] = (business_id,business_name,business_pic,business_price,str(business_rating))

    print(u'{0} businesses found, querying business info ' \
        'for the top result "{1}" ...'.format(
            len(businesses), business_id))
    response = get_business(bearer_token, business_id)

    print(u'Result for business "{0}" found:'.format(business_id))
    #pprint.pprint(response, indent=2)
    return(array_ret)
