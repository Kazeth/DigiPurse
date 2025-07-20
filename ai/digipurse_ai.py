from openai import AzureOpenAI
from dotenv import load_dotenv
import os

# Load environment variables from a .env file
load_dotenv()

# --- Configuration for Azure OpenAI Service ---
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
API_VERSION = "2024-02-01" # A stable API version for Azure
DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "digipurse-ai")

# --- System Prompt for the DigiPurse AI Assistant ---
system_content = """
You are Digi, an AI support assistant for DigiPurse — a decentralized Web3 application for managing digital identity, ticketing, and payments on the Internet Computer Protocol (ICP).

Your primary role is to help users with questions about:
- How to manage their Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs).
- How NFT-based ticketing works and how to prevent fraud.
- How to perform secure, peer-to-peer payments.
- General account help, security best practices, and troubleshooting.
- Explaining the benefits of blockchain, such as user sovereignty, data privacy, and transparency.

Always be friendly, helpful, and clear in your explanations. Your goal is to make complex Web3 concepts easy for anyone to understand. You are a guide to a more secure and user-controlled digital life.
"""

# --- Initialize Azure OpenAI Client ---
# This section will raise an error if the required environment variables are not set.
if not all([AZURE_ENDPOINT, API_KEY, DEPLOYMENT_NAME]):
    raise ValueError("Azure OpenAI environment variables are not fully configured. Please check your .env file.")

client = AzureOpenAI(
    azure_endpoint=AZURE_ENDPOINT,
    api_key=API_KEY,
    api_version=API_VERSION,
)

def request_chat(prompt: str):
    """
    Sends a user's prompt to the Azure OpenAI service and gets a response.
    """
    try:
        response = client.chat.completions.create(
            model=DEPLOYMENT_NAME,
            messages=[
                {
                    "role": "system",
                    "content": system_content,
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            max_tokens=256,
            temperature=0.7,
            top_p=0.95,
        )
        return {"reply": response.choices[0].message.content}
    
    except Exception as e:
        print(f"An error occurred with Azure OpenAI API: {e}")
        return {"reply": "Sorry, I'm currently unable to process your request. Please try again later."}

