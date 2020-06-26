from textblob import TextBlob
import settings, json #a py file containing api access information
from ibm_watson import NaturalLanguageUnderstandingV1
from ibm_watson.natural_language_understanding_v1 import Features, SentimentOptions, ConceptsOptions, KeywordsOptions, CategoriesOptions, EmotionOptions
from ibm_cloud_sdk_core.authenticators import BasicAuthenticator
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from flask import Flask, render_template, redirect, url_for,request
from flask_cors import CORS
from flask import make_response

app = Flask(__name__)
CORS(app)
authenticator = IAMAuthenticator('CgNIbRG8SxkoCqqbiDNIbt-DsA4uKCsNHT2ZFqnAb2JY')
natural_language_understanding = NaturalLanguageUnderstandingV1(
    version="2020-03-12",
    authenticator=authenticator
)
natural_language_understanding.set_service_url('https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/5de9211d-d47c-46d9-ba40-c51d98fcb351')

@app.route("/")
def home():
    return ""

@app.route("/index")
def hello_world():
    return 'Hello, World!'

@app.route('/load', methods=['GET', 'POST'])
def load():
    if request.method == 'POST':
        with open('entries.json') as f:
            data = json.load(f)
            print(data)
        resp = make_response('{"content": '+json.dumps(data)+'}')
        resp.headers['Content-Type'] = "application/json"
        return resp

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
def login():
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
