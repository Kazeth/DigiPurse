# main.py
from uagents import Bureau
from agents.digiai import DigiAI  # Import your agent from digiai.py

# Create a bureau to manage agents
bureau = Bureau(endpoint="http://127.0.0.1:8001", port=8001)

# Add DigiAI to the bureau
bureau.add(DigiAI)

if __name__ == "__main__":
    print("🚀 Starting DigiAI Support Agent...")
    bureau.run()
