import settings, json #a py file containing api access information
import os
from flask import Flask, render_template, redirect, url_for,request
from flask_cors import CORS
from flask import make_response
import string

app = Flask(__name__)
CORS(app)

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

if __name__ == "__main__":
    app.run(debug = False, host = '0.0.0.0', port=5000, threaded=True)
    # host = '0.0.0.0',
