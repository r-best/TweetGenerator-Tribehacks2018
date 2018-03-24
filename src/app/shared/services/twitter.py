import tweepy
import json
import sys
import flask
from flask_cors import CORS

app = flask.Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})

def authenticate():
    keys = json.loads(open('../data/cred.json').read())
    auth = tweepy.OAuthHandler(keys['consumer_key'], keys['consumer_secret'])
    auth.set_access_token(keys['access_token_key'], keys['access_token_secret'])
    return tweepy.API(auth)

@app.route('/icons/<user>')
def getIconURL(user):
    print user
    try:
        x = authenticate().get_user(screen_name=user).profile_image_url
        print x
        return json.dumps(x)
    except tweepy.RateLimitError:
        return "Whoops, rate limit exceeded!"
    except tweepy.TweepError as err:
        print err.message[0]['message']
        return json.dumps(err.message[0]['message'])


if __name__ == '__main__':
    app.run(debug=False, port=5000)