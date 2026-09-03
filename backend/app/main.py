import time
import logging
import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.session import init_db
from app.api.routes import router as api_router
from app.api.market_data_routes import router as market_data_router
from app.agents.orchestrator import agent_orchestrator


# =========================================================
# Logging Configuration
# =========================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger("main")


# =========================================================
# FastAPI Application
# =========================================================

app = FastAPI(
    title=settings.APP_NAME,
    description="Autonomous AI Trading Scientist with Alpaca Paper Trading Integration",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# Autonomous Trading Background Loop
# =========================================================

def autonomous_trading_loop():
    logger.info(
        "Autonomous AI Trader Background Loop Started "
        "(Scanning real-time market data every 15s)..."
    )

    # Give the application a few seconds to finish startup
    time.sleep(5)

    while True:
        try:
            res = agent_orchestrator.run_autonomous_scan()

            if res.get("auto_executed"):
                logger.info(
                    f"AUTONOMOUS TRADE EXECUTED: "
                    f"{res['qty']} {res['symbol']} "
                    f"@ ${res['price']:.2f}"
                )

        except Exception as e:
            logger.error(
                f"Error in autonomous trading loop: {e}"
            )

        time.sleep(15)


# =========================================================
# Startup
# =========================================================

@app.on_event("startup")
def on_startup():
    logger.info(
        "Initializing ALPHA HUNTER database schema..."
    )

    init_db()

    # Start autonomous trading engine in background
    t = threading.Thread(
        target=autonomous_trading_loop,
        daemon=True
    )

    t.start()

    logger.info(
        "ALPHA HUNTER Autonomous AI Trader Engine "
        "Active & Background Loop Running."
    )


# =========================================================
# Root Endpoint
# =========================================================

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "message": "ALPHA HUNTER Autonomous AI Trading Scientist is running.",
        "docs_url": "/docs",
        "health_url": "/health",
        "api_url": "/api",
        "version": "1.0.0"
    }


# =========================================================
# Health Check
# =========================================================

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "app_name": settings.APP_NAME,
        "demo_mode": settings.DEMO_MODE,
        "autonomous_active": agent_orchestrator.autonomous_active,
        "paper_trading": True
    }


# =========================================================
# API Routers
# =========================================================

app.include_router(api_router)
app.include_router(market_data_router)


# =========================================================
# Local Development
# =========================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
