from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from openai import AzureOpenAI

# --- 1. Load Configuration ---
load_dotenv()

# Setup Azure OpenAI Client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-02-01", # Use a recent, valid API version
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)
AZURE_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

# Check if configuration is loaded
if not all([client.api_key, client.azure_endpoint, AZURE_DEPLOYMENT_NAME]):
    raise ValueError("Azure OpenAI configuration is missing in your .env file!")

# --- 2. Keep Your Core Prompt ---
# This valuable instruction set is reused directly!
SYSTEM_PROMPT = """
You are DigiAI, an AI support assistant for DigiPurse — a decentralized Web3 app on ICP.
Help users with:
- Managing DIDs & VCs (like digital IDs and verified credentials)
- NFT ticketing (how to buy, transfer, avoid scams)
- P2P payments (secure, fast, no intermediaries)
- Account help, security, troubleshooting
- Benefits of blockchain: privacy, sovereignty, transparency

Be friendly, clear, and educational. Never give financial advice. Guide, don't control.
Always remind users: 'You own your data. No one can take it — including us.'
"""

# --- 3. Create a Flask Web Application ---
app = Flask(__name__)

# --- 4. Define the AI Query Function ---
def ask_azure_ai(question: str):
    """Sends the prompt and question to Azure OpenAI and gets a response."""
    try:
        response = client.chat.completions.create(
            model=AZURE_DEPLOYMENT_NAME,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=400
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"An error occurred: {e}")
        return "Sorry, I'm having trouble connecting to my brain right now. Please try again later."

# --- 5. Create an API Endpoint ---
@app.route("/query", methods=["POST"])
def handle_query():
    """This endpoint receives user questions and returns the AI's answer."""
    data = request.get_json()
    if not data or "question" not in data:
        return jsonify({"error": "No question provided"}), 400

    user_question = data["question"]
    print(f"User asked: {user_question}")

    # Get the answer from Azure AI
    ai_answer = ask_azure_ai(user_question)

    # Return the answer as JSON
    return jsonify({
        "answer": ai_answer,
        "helpful": True
    })

# --- 6. Run the Application ---
if __name__ == "__main__":
    print("DigiAI is live and ready to help! 🚀")
    print("Supporting decentralized identity on ICP — safely & simply.")
    # Runs the web server on http://127.0.0.1:8001
    app.run(port=8001, debug=True)