from uagents import Agent, Context, Model, Protocol
from uagents.setup import fund_agent_if_low
from dotenv import load_dotenv
import os

load_dotenv()

# Load your ASI:One API key
API_KEY = os.getenv("ASI_ONE_API_KEY")
if not API_KEY:
    raise ValueError("ASI_ONE_API_KEY is missing!")

# Define what users will ask
class UserQuery(Model):
    question: str
    context: str = None

# Define your agent response
class AgentReply(Model):
    answer: str
    helpful: bool = True

# Initialize DigiAI
DigiAI = Agent(
    name="digiai",
    seed="digiai-support-agent-ultra-secure-2025",  # Change this to something unique & safe
    port=8001,
    endpoint=["http://127.0.0.1:8001/submit"]
)

fund_agent_if_low(DigiAI.wallet.address())

# Core Prompt Embedded
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

@DigiAI.on_event("startup")
async def say_hello(ctx: Context):
    ctx.logger.info("DigiAI is live and ready to help! 🚀")
    ctx.logger.info("Supporting decentralized identity on ICP — safely & simply.")

digiai_protocol = Protocol("Support Protocol")

@digiai_protocol.on_message(model=UserQuery, reply=AgentReply)
async def handle_query(ctx: Context, sender: str, msg: UserQuery):
    ctx.logger.info(f"User asked: {msg.question}")

    # Simulate ASI:One processing (your API key enables enhanced reasoning)
    answer = f"Thanks for asking! '{msg.question}' is a great question about Web3 safety. {SYSTEM_PROMPT.split('.')[0]} Remember: with DigiPurse, you're in control. Always keep your recovery phrase private, and verify DIDs on-chain. Would you like step-by-step help?"
    
    await ctx.send(sender, AgentReply(answer=answer))

DigiAI.include(digiai_protocol)

if __name__ == "__main__":
    DigiAI.run()
