from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ------------ LOGIN --------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    # simple check
    if username == "admin" and password == "123":
        return jsonify({"status": "success", "token": "abc123"})

    return jsonify({"status": "error"}), 401
# ----------------------------------


@app.route("/recommendation", methods=["GET"])
def recommendation():
    return jsonify({
        "recommendations": [
            {"product": "Laptop", "probability": 0.85},
            {"product": "Mouse", "probability": 0.65},
            {"product": "Keyboard", "probability": 0.58}
        ]
    })


@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    text = data.get("text", "")
    summary = text[:50] + "..." if len(text) > 50 else text
    return jsonify({"summary": summary})


@app.route("/anomalies", methods=["GET"])
def anomalies():
    data = [
        {"month": "Jan", "sales": 10, "z_score": -0.2, "anomaly": False},
        {"month": "Feb", "sales": 12, "z_score": -0.1, "anomaly": False},
        {"month": "Mar", "sales": 13, "z_score": 0.0,  "anomaly": False},
        {"month": "Apr", "sales": 50, "z_score": 3.2,  "anomaly": True},
        {"month": "May", "sales": 11, "z_score": -0.15,"anomaly": False},
        {"month": "Jun", "sales": 9,  "z_score": -0.3, "anomaly": False},
        {"month": "Jul", "sales": 14, "z_score": 0.2,  "anomaly": False},
    ]
    return jsonify({"data": data})


if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True)
