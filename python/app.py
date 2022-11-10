from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

movies = [
    {
        "name": "boyhood",
        "cast": ["Ethan hawke", "patricia arquette"],
        "genre": ["coming of age", "slice of life"],
    },
    {"name": "tumbling doll of flesh", "cast": ["x"], "genre": ["horror"]},
]


@app.route("/test", methods=["GET", "POST"])
def testfn():

    if request.method == "GET":
        message = {"greeting": "Hello from Flask!"}
        return jsonify(message)

    if request.method == "POST":
        print(request.get_json())  # parse as JSON
        print("success")
        return "Sucesss", 200


@app.route("/basic", methods=["GET", "POST"])
def testfn():

    if request.method == "POST":
        print(request.get_json())
        print("success")
        return "Sucesss", 200


app.run()
