import time
import logging
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.session import init_db
from app.api.routes import router as api_router
from app.agents.orchestrator import agent_orchestrator

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("main")

app = FastAPI(
    title=settings.APP_NAME,
    description="Autonomous AI Trading Scientist with Alpaca Paper Trading Integration",
    version="1.0.0"
)

# Enable CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def autonomous_trading_loop():
    logger.info("Autonomous AI Trader Background Loop Started (Scanning real-time market data every 15s)...")
    time.sleep(5) # Grace period on startup
    while True:
        try:
            res = agent_orchestrator.run_autonomous_scan()
            if res.get("auto_executed"):
                logger.info(f"AUTONOMOUS TRADE EXECUTED: {res['qty']} {res['symbol']} @ ${res['price']:.2f}")
        except Exception as e:
            logger.error(f"Error in autonomous trading loop: {e}")
        time.sleep(15)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing ALPHA HUNTER database schema...")
    init_db()
    
    # Start Autonomous AI Trading Background Loop
    t = threading.Thread(target=autonomous_trading_loop, daemon=True)
    t.start()
    logger.info("ALPHA HUNTER Autonomous AI Trader Engine Active & Background Loop Running.")

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "app_name": settings.APP_NAME,
        "demo_mode": settings.DEMO_MODE,
        "autonomous_active": agent_orchestrator.autonomous_active,
        "paper_trading": True
    }

from app.api.market_data_routes import router as market_data_router

app.include_router(api_router)
app.include_router(market_data_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
