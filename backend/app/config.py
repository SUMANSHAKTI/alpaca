import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

# Load environment variables from workspace root .env file
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="allow")

    APP_NAME: str = "ALPHA HUNTER — Autonomous AI Trading Scientist"
    ALPACA_API_KEY: str = os.getenv("ALPACA_API_KEY", "")
    ALPACA_SECRET_KEY: str = os.getenv("ALPACA_SECRET_KEY", "")
    ALPACA_BASE_URL: str = os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets")
    
    # Mode flags
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "mock")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Database & Portfolio
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./alpha_hunter.db")
    INITIAL_CAPITAL: float = 100000.0
    
    # Hard Deterministic Risk Defaults
    MAX_SINGLE_POSITION_PCT: float = 0.25
    MAX_STRATEGY_ALLOCATION_PCT: float = 0.45
    MAX_PORTFOLIO_DAILY_LOSS_PCT: float = 0.05
    MAX_PORTFOLIO_DRAWDOWN_PCT: float = 0.15
    MAX_SECTOR_EXPOSURE_PCT: float = 0.40

settings = Settings()

