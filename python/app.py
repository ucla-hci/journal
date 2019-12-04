import operator
import re
import string

from empath import Empath
from flask import (Flask, make_response, redirect, render_template, request,
                   url_for)
from textblob import TextBlob, Word
from textblob.classifiers import NaiveBayesClassifier

import eliza_util

# import sys 
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
        
        eliza = eliza_util.Eliza()
        eliza.load('doctor.txt')
        # print ("done loading!")

        # sentiment from training data
        # clsrslt = textobj.sentences[total - 1].classify()

        # sentiment from sentiment analysis
        if (textobj.sentences[total - 1].sentiment.polarity <= -.5):
            clsrslt = "neg"
        elif (textobj.sentences[total - 1].sentiment.polarity >= 0.5):
            clsrslt = "pos"
        else:
            clsrslt = "nan"

        # determine relevant words in sentence to underline
        lexicon = Empath()
        cats = lexicon.cats.keys()

        st = str(textobj.sentences[total - 1])
        auto_sug = eliza.respond(st)

        #remove punctuation
        st = st.translate(str.maketrans('', '', string.punctuation))

        # extract parts of speech for lemmatization
        pos = TextBlob(st).tags
        pos = [item for t in pos for item in t] 
        pos = pos[1:len(pos)+1:2]

        # list of all words in sentence 
        words = st.split(" ")

        # list of lemmatized words 
        words_l = []
        index = list(range(len(words)))

        # lemmatize all words per part of speech
        for (word, p) in zip(words,pos):
            try:
                words_l.append(Word(word).lemmatize(p))
            except Exception: 
                words_l.append(word)

        # lemmatized sentene 
        st = " ".join(words_l)

        w_dict = dict(zip(index, words)) 
        l_dict = dict(zip(index, words_l)) 

        # find categories
        effect = {}

        for cat in cats:
            score = lexicon.analyze(st, normalize = False, categories=[cat])[cat]
            if (score > 0):
                d = { cat : score }
                effect.update (d)

        # extract words that contribute to category
        for word_d in l_dict:
            dump = {}
            words_l.remove(l_dict[word_d])
            sample = " ".join(words_l)

            for cat in cats:
                score = lexicon.analyze(sample, normalize = False, categories=[cat])[cat]
                if (score > 0):
                    d = { cat : score }
                    dump.update (d)

            # remove words that do not contribute to category
            remove = True
            if (len(dump) == len (effect)):
                for d in dump:
                    if (dump[d]  < effect[d]):
                        remove = False
            elif(len(dump) < len (effect)):
                remove = False
                
            if (remove):
                del w_dict[word_d]
            
            if (remove == False):
                words_l.append(l_dict[word_d])

        # words (unlemmatized) that contribute to categories
        words = list(w_dict.values())
        words = str(" ".join(words))

        effect = sorted(effect.items(), key=operator.itemgetter(1), reverse=True)
        effect = [item for t in effect for item in t] 

        # catgories
        categories = effect[::2]

        if (clsrslt == "nan"):
            if (len(effect) > 0):
                if ("positive_emotion" in effect):
                    clsrslt = "pos"
                    categories.remove("positive_emotion")
                elif ("negative_emotion" in effect):
                    clsrslt = "neg"
                    categories.remove("negative_emotion")
                elif ("emotional" in effect):
                    clsrslt = "neg"

        categories = str(" ".join(categories))
        result = clsrslt

        resp = make_response('{"valence": "'+result+'", "cats": "'+categories+'", "und": "'+words+'", "eliza": "'+auto_sug+'", "start": '+str(textobj.sentences[total - 1].start)+', "end": '+str(textobj.sentences[total-1].end)+'}')
        resp.headers['Content-Type'] = "application/json"

        return resp

if __name__ == "__main__":
    cl = NaiveBayesClassifier(train)
    app.run(debug = True)
