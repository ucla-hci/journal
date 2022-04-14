#
# 04/12/22 New minimal flask server to offload heavy processing
#

from flask import Flask
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
api = Api(app)

sample_data = {}

parser = reqparse.RequestParser()


class Rephrase(Resource):
    def post(self):
        parser.add_argument("title")
        parser.add_argument("content")
        args = parser.parse_args()
        print(args)
        return ["returned", 201]


api.add_resource(Rephrase, '/rephrase/')

if __name__ == "__main__":
    app.run(debug=True)
