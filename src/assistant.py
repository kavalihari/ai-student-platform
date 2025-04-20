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

@app.route("/quiz", methods=["POST"])
def generate_quiz():
    data = request.get_json()
    notes = data.get("notes")
    num_questions = int(data.get("num_questions", 5))
    time_per_q = int(data.get("time_per_question", 60))

    prompt = f"""
You are an AI quiz generator.
Based on the following content:

{notes}

Generate {num_questions} multiple-choice questions.
Format:
- Question N: [difficulty]
- New line for question
- A) ...
  B) ...
  C) ...
  D) ...
  E) ...
- Answer: X
"""

    response = client.chat.completions.create(
        model="openai/gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You're a quiz generation assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    return jsonify({
        "quiz_text": response.choices[0].message.content,
        "time_per_question": time_per_q
    })

@app.route("/quiz/evaluate", methods=["POST"])
def evaluate_quiz():
    data = request.get_json()
    quiz_text = data.get("quiz_text")
    user_answers = data.get("user_answers")
    time_per_question = int(data.get("time_per_question", 60))
    total_time_taken = int(data.get("total_time_taken", 300))

    summary_prompt = f"""
Evaluate the quiz below. For each question, show:
- Question
- Correct answer
- User answer
- Correct/Incorrect
- Explanation
Then summary:
• 🧠 Total Questions
• ✅ Correct Answers
• ❌ Incorrect Answers
• ⏱️ Time per Question: {time_per_question} sec
• ⌛ Total Time Taken: {total_time_taken} sec
• 📈 Accuracy
• 🌟 Feedback

User Answers:
{user_answers}

Quiz:
{quiz_text}
"""

    response = client.chat.completions.create(
        model="openai/gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a tutor that gives quiz feedback."},
            {"role": "user", "content": summary_prompt}
        ]
    )
    return jsonify({"evaluation_result": response.choices[0].message.content})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
