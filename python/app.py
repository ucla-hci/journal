from empath import Empath
from textblob import TextBlob
from textblob import Word
from textblob.classifiers import NaiveBayesClassifier
from nltk.corpus import stopwords
from flask import Flask, render_template, redirect, url_for,request
from flask import make_response
from fuzzywuzzy import fuzz
import re
import string
import operator
import eliza_util

app = Flask(__name__)

shoulds = 'should people that be rules always believe believed have shouldnt shouldve'
fortunes = 'will going to definitely must happen end up outcome actually inevitable choice always never id'
blaming = 'blame blamed blaming not my fault their unfair fair resentful unfair that was'
words = ['should','rules','believe','believed','college','must','blame','wrong','fault','die','panicked','worried','panic','responsible','guilty','feeling','change','loser','bitter','never','again','jealous','sacrifice'] 

@app.route("/")
def home():
    return ""
@app.route("/index")

@app.route('/check', methods=['GET', 'POST'])
def check():
    if request.method == 'POST':
        datafromjs = request.form['mydata']
        textobj = TextBlob(datafromjs)
        total = len(textobj.words)
        freq = 0
        for i in range(0, len(words)):
            freq += textobj.words.count(words[i])
        return str(freq)
    
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        datafromjs = request.form['mydata']
        
        textobj = TextBlob(datafromjs)
        total = len(textobj.sentences)
        
        eliza = eliza_util.Eliza()
        eliza.load('doctor.txt')

        # sentiment from sentiment analysis
        if (textobj.sentences[total - 1].sentiment.polarity <= -.7): #splitting
            clsrslt = "spl"
        else:
            st = str(textobj.sentences[total - 1])
            st = st.translate(str.maketrans('', '', string.punctuation))
            st = st.lower()
            #words = st.split(" ")
            #filtered = [w for w in words if not w in set(stopwords.words('english'))]
            #st = " ".join(filtered)

            sld = fuzz.token_set_ratio(st, shoulds)
            frt = fuzz.token_set_ratio(st, fortunes)
            blm = fuzz.token_set_ratio(st, blaming)

            if (sld > frt and sld > blm and sld > 30): #shoulds
                clsrslt = "sld"
            elif (frt > blm and frt > 30): #fortune-telling
                clsrslt = "frt"
            elif (blm > 30): #blaming
                clsrslt = "blm"
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

        if (len(effect) > 0):
            if ("positive_emotion" in effect):
                val = "pos"
                categories.remove("positive_emotion")
            elif ("negative_emotion" in effect):
                val = "neg"
                categories.remove("negative_emotion")
            elif ("emotional" in effect):
                val = "neg"

        categories = str(" ".join(categories))
        result = clsrslt

        resp = make_response('{"class": "'+result+'", "valence": "'+val+'", "cats": "'+categories+'", "und": "'+words+'", "eliza": "'+auto_sug+'", "start": '+str(textobj.sentences[total - 1].start)+', "end": '+str(textobj.sentences[total-1].end)+'}')
        resp.headers['Content-Type'] = "application/json"

        return resp

if __name__ == "__main__":
    app.run(debug = True)