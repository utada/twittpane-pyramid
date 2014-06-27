from pyramid.view import view_config
from pyramid.view import view_defaults
from pyramid.httpexceptions import HTTPFound, HTTPCreated
from pyramid.response import Response
from twython import Twython, TwythonError
import sys, os
import json
import configparser
import pprint

DIR = os.path.dirname(os.path.realpath(__file__))
pp = pprint.PrettyPrinter(indent=4)
config = configparser.ConfigParser()
f = config.read(DIR + '/secrets.ini')
#print(f)
#print(config.sections())
APP_KEY = config['DEV']['APP_KEY']
APP_SECRET = config['DEV']['APP_SECRET']

CALLBACK_URL='http://freegate.co:5003/callback'

@view_config(route_name='home', renderer='templates/home.jinja2')
def home(request):
    return {'project': 'twittpane'}

@view_config(route_name='callback', renderer='json')
def callback(request):
    oauth_verifier = request.GET['oauth_verifier']
    OAUTH_TOKEN = request.cookies['oauth_token']
    OAUTH_TOKEN_SECRET = request.cookies['oauth_token_secret']

    twitter = Twython(APP_KEY, APP_SECRET,
                      OAUTH_TOKEN,
                      OAUTH_TOKEN_SECRET)

    final_step = twitter.get_authorized_tokens(oauth_verifier)
    OAUTH_TOKEN = final_step['oauth_token']
    OAUTH_TOKEN_SECRET = final_step['oauth_token_secret']

    # set cookies
    response = HTTPFound(location='/')
    #response.set_cookie('oauth_token', OAUTH_TOKEN, max_age=86400)
    #response.set_cookie('oauth_token_secret', OAUTH_TOKEN_SECRET, max_age=86400)
    response.set_cookie('oauth_token', OAUTH_TOKEN)
    response.set_cookie('oauth_token_secret', OAUTH_TOKEN_SECRET)
    return response

@view_defaults(renderer='json')
class TwyAPI(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='auth')
    def auth(self):
        self.twitter = Twython(APP_KEY, APP_SECRET)
        auth = self.twitter.get_authentication_tokens(callback_url=CALLBACK_URL)
        print(auth)
        # From the auth variable, save the oauth_token_secret for later use (these are not the final auth tokens). In Django or other web frameworks, you might want to store it to a session variable
        url = auth['auth_url']
        OAUTH_TOKEN = auth['oauth_token']
        OAUTH_TOKEN_SECRET = auth['oauth_token_secret']

        #print(url)
        response = HTTPFound(location=url)
        response.set_cookie('oauth_token', OAUTH_TOKEN, max_age=86400)
        response.set_cookie('oauth_token_secret', OAUTH_TOKEN_SECRET, max_age=86400)
        return response

    @view_config(route_name='validate_auth')
    def validate_auth(self):
        if 'oauth_token' in self.request.cookies and 'oauth_token_secret' in self.request.cookies:
            print(self.request.cookies)
            #print(self.request.cookies['oauth_token'])
            OAUTH_TOKEN = self.request.cookies['oauth_token']
            OAUTH_TOKEN_SECRET = self.request.cookies['oauth_token_secret']
            self.twitter = Twython(APP_KEY, APP_SECRET,
                                   OAUTH_TOKEN,
                                   OAUTH_TOKEN_SECRET)
            return True
        else:
            return False

    @view_config(route_name='verify_credentials')
    def verify_credentials(self):
        if not hasattr(self, 'twitter'):
            if not self.validate_auth():
                return None
        try:
            return self.twitter.verify_credentials()
        except TwythonError as e:
            return {"verify_credentials": e}

    @view_config(route_name='get_saved_searches')
    def get_saved_searches(self):
        if not hasattr(self, 'twitter'):
            if self.validate_auth() == False:
                return None
        try:
            return self.twitter.get_saved_searches()
        except TwythonError as e:
            return {"get_saved_searches": e}

    @view_config(route_name='create_saved_search')
    def create_saved_search(self):
        if not hasattr(self, 'twitter'):
            if self.validate_auth() == False:
                return None
        try:
            params = self.request.GET.dict_of_lists()
            return self.twitter.create_saved_search(**params)
        except TwythonError as e:
            return {"create_saved_search": e}

    @view_config(route_name='destroy_saved_search')
    def destroy_saved_search(self):
        if not hasattr(self, 'twitter'):
            if self.validate_auth() == False:
                return None
        try:
            #id_str = self.request.params['id']
            params = {'id': self.request.params['id']}
            print(params)
            return self.twitter.destroy_saved_search(**params)
        except TwythonError as e:
            return {"destroy_saved_search": e}

    @view_config(route_name='search')
    def search(self):
        if not hasattr(self, 'twitter'):
            if self.validate_auth() == False:
                return None
        try:
            params = self.request.GET.dict_of_lists()
            return self.twitter.search(**params)
        except TwythonError as e:
            return {"search": e}

    @view_config(route_name='get_home_timeline')
    def get_home_timeline(self):
        if not hasattr(self, 'twitter'):
            if self.validate_auth() == False:
                return None
        try:
            params = self.request.GET.dict_of_lists()
            return self.twitter.get_home_timeline(**params)
        except TwythonError as e:
            return {"get_home_timeline": e}


