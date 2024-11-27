from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.get("/")
def test():
    # returns json
    return {"members": ["Member1", "Member2", "Member3"]}


if __name__ == "__main__":
    app.run(debug=True)
