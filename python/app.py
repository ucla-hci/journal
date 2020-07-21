from textblob import TextBlob
import settings, json #a py file containing api access information
import os
from ibm_watson import NaturalLanguageUnderstandingV1
from ibm_watson.natural_language_understanding_v1 import Features, SentimentOptions, ConceptsOptions, KeywordsOptions, CategoriesOptions, EmotionOptions
from ibm_cloud_sdk_core.authenticators import BasicAuthenticator
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from flask import Flask, render_template, redirect, url_for,request
from flask_cors import CORS
from flask import make_response
from auto_suggest import get_output
from fuzzywuzzy import fuzz
import re
import string
import operator
import eliza_util
from empath import Empath

app = Flask(__name__)
CORS(app)
authenticator = IAMAuthenticator('CgNIbRG8SxkoCqqbiDNIbt-DsA4uKCsNHT2ZFqnAb2JY')
natural_language_understanding = NaturalLanguageUnderstandingV1(
    version="2020-03-12",
    authenticator=authenticator
)
natural_language_understanding.set_service_url('https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/5de9211d-d47c-46d9-ba40-c51d98fcb351')

shoulds = 'should people that be rules always believe believed have shouldnt shouldve'
fortunes = 'will going to definitely must happen end up outcome actually inevitable choice always never id'
blaming = 'blame blamed blaming not my fault their unfair fair resentful unfair that was'
words = ['should','rules','believe','believed','college','must','blame','wrong','fault','die','panicked','worried','panic','responsible','guilty','feeling','change','loser','bitter','never','again','jealous','sacrifice'] 


@app.route("/")
def home():
    return ""

# System APIs
@app.route("/index")
def hello_world():
    return 'Hello, World!'

@app.route('/load', methods=['GET', 'POST'])
def load():
    if request.method == 'POST':
        filenm = request.form['filename']

        if not(os.path.exists(filenm+'.json')):    # Windows Error Handler
            return "Load Failed"

        try:    # Linux Error Handler
            with open(filenm+'.json', 'r', encoding='utf-8') as file:
                json = file.read()
                #print(json)
                return json
        except FileNotFoundError:
            return "Load Failed"

@app.route('/save', methods=['GET', 'POST'])
def save():
    if request.method == 'POST':
        entry = request.form['entry']
        filenm = request.form['filename']
        
        try:    # Error Handler
            with open(filenm+'.json', 'w', encoding='utf-8') as file:
                print(entry)
                file.write(entry)
                return "Save Succeeded"
        except:
            print("Unexpected error:", sys.exc_info()[0])
            return "Save Failed"

'''
@app.route('/id', methods=['GET', 'POST'])
def ids():
    if request.method == 'GET':
        with open('id.json', 'r', encoding='utf-8') as file:
            currentID = file.read()
            return str(currentID)
        return "Get ID Failed"

    elif request.method == 'POST':
        id = request.form['id']
        with open('id.json', 'w', encoding='utf-8') as file:
            file.write(id)
            return "Update ID Succeeded"
        return "Update ID Failed"
'''

@app.route('/menu', methods=['GET', 'POST'])
def menu():
    if request.method == 'GET':
        if not(os.path.exists('menu.json')):    # Windows Error Handler
            return "Get menu Failed"

        try:    # Linux Error Handler
            with open('menu.json', 'r', encoding='utf-8') as file:
                json = file.read()
                print(json)
                return json
        except FileExistsError:
            return "Get menu Failed"

    elif request.method == 'POST':
        newMenu = request.form['menu']
        with open('menu.json', 'w', encoding='utf-8') as file:
            print(newMenu)
            file.write(newMenu)
            return "Update menu Succeeded"
        return "Update menu Failed"

@app.route('/del', methods=['GET', 'POST'])
def delete():
    if request.method == 'POST':
        filenm = request.form['filename']
        if os.path.exists(filenm+'.json'):
            os.remove(filenm+'.json')
            return "Delete entry Succeeded"
        else:
            return "Delete entry Failed"

# Garce APIs
@app.route('/check', methods=['GET', 'POST'])
def check():
    if request.method == 'POST':
        datafromjs = request.form['sentence']
        textobj = TextBlob(datafromjs)
        total = len(textobj.sentences)
        last = textobj.sentences[total-1]
        result = get_output(str(last))
        '''
        for sen in textobj.sentences:
            result = get_output(str(sen))
            print(result)
        textobj = TextBlob(datafromjs)
        total = len(textobj.words)
        freq = 0
        for i in range(0, len(words)):
            freq += textobj.words.count(words[i])
        return str(freq)
        '''
        return str(result)

@app.route("/autocomp", methods=['GET', 'POST'])
def complete():
    if request.method == 'POST':
        source = request.form['sentence']
        result = get_output(source)
    return result

@app.route('/cd', methods=['GET', 'POST'])
def cd():
    if request.method == 'POST':
        datafromjs = request.form['mydata']
        
        textobj = TextBlob(datafromjs)
        total = len(textobj.sentences)
        
        eliza = eliza_util.Eliza()
        eliza.load('doctor.txt')

        # sentiment from sentiment analysis
        if (textobj.sentences[total - 1].sentiment.polarity <= 0):
            val = "neg"
        elif (textobj.sentences[total - 1].sentiment.polarity > 0):
            val = "pos"
        else:
            val = "nan"


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

        if (val == "nan"):
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


# Watson APIs
@app.route('/emotions', methods=['GET', 'POST'])
def emotion():
    if request.method == 'POST':
        keywords_str = request.form['mydata']
        js = json.loads(keywords_str)
        keywords = js["keywords"]
        watson_response = natural_language_understanding.analyze(
            text=str(js["text"]),
            features=Features(emotion=EmotionOptions(targets=keywords))).get_result()
        print(watson_response)
        return watson_response

@app.route('/keywords', methods=['GET', 'POST'])
def keyword():
   if request.method == 'POST':
        datafromjs = request.form['mydata']
        watson_response = natural_language_understanding.analyze(
                text=str(datafromjs),
                features=Features(keywords=KeywordsOptions(sentiment=True,emotion=True))).get_result()
        #print(watson_response)
        '''
        textobj = TextBlob(datafromjs)
        total = len(textobj.sentences)

        sentiments = []
        starts = []
        ends = []
        print(datafromjs, textobj)
        for sen in textobj.sentences:
            watson_response = natural_language_understanding.analyze(
                text=str(sen),
                features=Features(keywords=KeywordsOptions(sentiment=True,emotion=True))).get_result()
            #sentiments.append(watson_response['sentiment']['document']['label'])
            #starts.append(sen.start)
            #ends.append(sen.end)

        #print(sentiments)
        

        # sentiment from sentiment analysis
        
        if (textobj.sentences[total - 1].sentiment.polarity <= -.5):
            clsrslt = "neg"
        elif (textobj.sentences[total - 1].sentiment.polarity >= 0.5):
            clsrslt = "pos"
        else:
            clsrslt = "nan"
        

        jsonsents = json.dumps(sentiments)
        jsonstarts = json.dumps(starts)
        jsonends = json.dumps(ends)

        resp = make_response('{"valence": '+jsonsents+', "starts": '+jsonstarts+', "ends": '+jsonends+'}')
        resp.headers['Content-Type'] = "application/json"
        return resp
        '''
        return watson_response

if __name__ == "__main__":
    app.run(debug = False, host = '0.0.0.0', port=5000, threaded=True)
    # host = '0.0.0.0',
