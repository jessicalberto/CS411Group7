#!/usr/bin/python
from flask import Flask, render_template
from app import app
import argparse
import json
import pprint
import requests
import sys
import urllib
#for login
from flask_wtf import Form
from wtforms import StringField, BooleanField
from wtforms.validators import DataRequired
from flask import render_template, flash, redirect
from app import app
from .forms import LoginForm

from urllib.error import HTTPError
from urllib.parse import quote
from urllib.parse import urlencode


class LoginForm(Form):
    openid = StringField('openid', validators=[DataRequired()])
    remember_me = BooleanField('remember_me', default=False)

class SearchForm(Form):
    search_term = StringField('name', validators=[DataRequired()])
    location = StringField('location', validators=[DataRequired()])

# API constants, you shouldn't have to change these.
API_HOST = 'https://api.yelp.com'
SEARCH_PATH = '/v3/businesses/search'
BUSINESS_PATH = '/v3/businesses/'  # Business ID will come after slash.
TOKEN_PATH = '/oauth2/token'
GRANT_TYPE = 'client_credentials'

CLIENT_ID = app.config['CLIENT_ID']
CLIENT_SECRET = app.config['CLIENT_SECRET']

# Defaults for our simple example.
DEFAULT_TERM = 'dinner'
DEFAULT_LOCATION = 'San Francisco, CA'
SEARCH_LIMIT = 5

@app.route('/')
@app.route('/index')

def index():
    return render_template('index.html',
                            title='Home')

@app.route('/search', methods=['GET','POST'])
def yelp_search():
     form = SearchForm()
     if form.validate_on_submit():
        #  flash('Searched for "%s", in %s' %
        #        (form.search_term.data, form.location.data))
         search_term = form.search_term.data
         location = form.location.data
         results = query_api(search_term, location)#query_api(search_term, location)
         return render_template('index.html',
                                title='Search',
                                results = results,
                                )

     return render_template('search.html',
                            title='Search',
                            form = form,
                            )

# index view function suppressed for brevity
@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        flash('Login requested for Openid="%s", remember_me=%s' %
              (form.openid.data, str(form.remember_me.data)))
        return redirect('/index')
    return render_template('login.html',
                           title='Sign In',
                           form=form)

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
