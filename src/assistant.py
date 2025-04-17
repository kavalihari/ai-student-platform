from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)

@app.route("/explain", methods=["POST"])
def explain():
    data = request.get_json()
    text = data.get("text")
    goal = data.get("goal")

    if not text:
        return jsonify({"error": "No text provided."}), 400

    try:
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": f"You are an expert teacher who makes learning fun, simple, and motivating. "
                               f"Your job is to explain the student's topic in a step-by-step, clear, and engaging way. "
                               f"The student’s goal is: '{goal}'. Use relatable examples and a friendly tone like a teacher "
                               f"who truly cares about the student’s success."
                },
                {
                    "role": "user",
                    "content": text
                }
            ]
        )
        explanation = response.choices[0].message.content
        return jsonify({"explanation": explanation})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

