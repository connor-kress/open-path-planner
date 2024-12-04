from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.get("/path")
def test():
    try:
        lat1 = float(request.args["lat1"])
        lon1 = float(request.args["lon1"])
        lat2 = float(request.args["lat2"])
        lon2 = float(request.args["lon2"])
    except (ValueError, TypeError, KeyError):
        return {"error": "Invalid or missing query parameters"}
    # start = (lat1, lon1)
    # finish = (lat2, lon2)
    return {"start": [lat1, lon1], "finish": [lat2, lon2]}


if __name__ == "__main__":
    app.run(debug=True)
