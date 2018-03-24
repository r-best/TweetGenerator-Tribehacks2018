import tweepy
import json
import sys
import flask
from flask_cors import CORS
import numbers

app = flask.Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})

def authenticate():
    keys = json.loads(open('../data/cred.json').read())
    auth = tweepy.OAuthHandler(keys['consumer_key'], keys['consumer_secret'])
    auth.set_access_token(keys['access_token_key'], keys['access_token_secret'])
    return tweepy.API(auth)

@app.route('/users/<user>')
def getUser(user):
    try:
        x = authenticate().get_user(screen_name=user)
        return json.dumps({'name': x.name, 'screen_name': x.screen_name, 'profile_image_url': x.profile_image_url})
    except tweepy.RateLimitError:
        return json.dumps("Whoops, rate limit exceeded!")
    except tweepy.TweepError as err:
        return json.dumps(err.message[0]['message'])

@app.route('/tweets/<user>')
def getUserTweets(user):
    numPages = flask.request.args.get('pages')
    if numPages is None:
        numPages = 1
    else:
        numPages = int(numPages)
    try:
        api = authenticate()
        tweets = []
        for i in range(1, numPages+1):
            user_tweets = api.user_timeline(screen_name=user, count=200, page=i)
            for tweet in user_tweets:
                if 'RT @' not in tweet.text:
                    try:
                        tweets.append(tweet.text.encode('ascii'))
                    except UnicodeEncodeError:
                        continue
        return json.dumps(tweets)
    except tweepy.RateLimitError:
        return "Whoops, rate limit exceeded!"
    except tweepy.TweepError as err:
        print err.message[0]['message']
        return json.dumps(err.message[0]['message'])


if __name__ == '__main__':
    app.run(debug=False, port=5000)