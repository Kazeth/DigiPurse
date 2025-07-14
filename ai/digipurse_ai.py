import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables from a .env file
load_dotenv()

# --- Configuration for Google Gemini API ---
API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-1.5-flash" # A powerful and fast model

# Configure the Gemini client
genai.configure(api_key=API_KEY)

# --- System Prompt for the DigiPurse AI Assistant ---
# This defines the AI's personality, knowledge, and purpose.
system_content = """
You are Digi, an AI support assistant for DigiPurse — a decentralized Web3 application for managing digital identity, ticketing, and payments on the Internet Computer Protocol (ICP).

Your primary role is to help users with questions about:
- How to manage their Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs).
- How NFT-based ticketing works and how to prevent fraud.
- How to perform secure, peer-to-peer payments.
- General account help, security best practices, and troubleshooting.
- Explaining the benefits of blockchain, such as user sovereignty, data privacy, and transparency.

When asked for information that might be outside your immediate knowledge, use your search tool to find relevant links, articles, or documentation.

Always be friendly, helpful, and clear in your explanations. Your goal is to make complex Web3 concepts easy for anyone to understand. You are a guide to a more secure and user-controlled digital life.
"""

# Initialize the generative model with the system instruction and tools
# By enabling the GoogleSearch tool, the model can access real-time information from the internet.
# FIX: The tool must be instantiated as an object using genai.protos.
model = genai.GenerativeModel(
    model_name=MODEL_NAME,
    system_instruction=system_content,
    tools=[genai.protos.Tool(
        google_search_retrieval=genai.protos.GoogleSearchRetrieval()
    )]
)

def request_chat(prompt: str):
    """
    Sends a user's prompt to the Gemini API and gets a response.
    The model will automatically use its search tool if needed.
    """
    if not API_KEY:
        return {"reply": "Gemini API key is not configured. Please check your .env file."}
        
    try:
        # Start a chat session to maintain context (optional but good practice)
        chat_session = model.start_chat(history=[])
        
        # Send the user's prompt
        response = chat_session.send_message(prompt)

        # Return the content of the AI's message
        # The model will include search results in its response text if it used the tool.
        return {"reply": response.text}
    
    except Exception as e:
        # Basic error handling
        print(f"An error occurred with Gemini API: {e}")
        return {"reply": "Sorry, I'm currently unable to process your request. Please try again later."}
