from textblob import TextBlob
from textblob.classifiers import NaiveBayesClassifier
from flask import Flask, render_template, redirect, url_for,request
from flask import make_response
app = Flask(__name__)

# list from textblob 
train = [('I love this sandwich.', 'pos'),('this is an amazing place!', 'pos'),('I feel very good about these beers.', 'pos'),('this is my best work.', 'pos'),("what an awesome view", 'pos'),('I do not like this restaurant', 'neg'),('I am tired of this stuff.', 'neg'),("I can't deal with this", 'neg'),('he is my sworn enemy!', 'neg'),('my boss is horrible.', 'neg'),('the beer was good.', 'pos'),('I do not enjoy my job', 'neg'),("I ain't feeling dandy today.", 'neg'),("I feel amazing!", 'pos'),('Gary is a friend of mine.', 'pos'),("I can't believe I'm doing this.", 'neg')]


@app.route("/")
def home():
    return ""
@app.route("/index")

@app.route('/login', methods=['GET', 'POST'])
def login():
   if request.method == 'POST':
        datafromjs = request.form['mydata']
        
        textobj = TextBlob(datafromjs, classifier=cl)
        total = len(textobj.sentences)
        
        # sentiment from training data
        # clsrslt = textobj.sentences[total - 1].classify()

        # sentiment from sentiment analysis
        if (textobj.sentences[total - 1].sentiment.polarity <= -.5):
            clsrslt = "neg"
        elif (textobj.sentences[total - 1].sentiment.polarity >= 0.5):
            clsrslt = "pos"
        else:
            clsrslt = "nan"

        result = clsrslt
        resp = make_response('{"valence": "'+result+'", "start": '+str(textobj.sentences[total - 1].start)+', "end": '+str(textobj.sentences[total-1].end)+'}')
        resp.headers['Content-Type'] = "application/json"
        return resp

if __name__ == "__main__":
    cl = NaiveBayesClassifier(train)
    app.run(debug = True)