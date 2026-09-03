import logging
from dotenv import load_dotenv
from app.config import settings

logger = logging.getLogger("alpaca_client")

class AlpacaClientManager:
    def __init__(self):
        self.api_key = ""
        self.secret_key = ""
        self.base_url = ""
        self.is_live_paper_available = False
        self.trading_client = None
        self.data_client = None
        
        self.reload_clients()

    def reload_clients(self):
        from pathlib import Path
        env_path = Path(__file__).resolve().parent.parent.parent / ".env"
        load_dotenv(dotenv_path=env_path, override=True)
        import os
        self.api_key = os.getenv("ALPACA_API_KEY", settings.ALPACA_API_KEY)
        self.secret_key = os.getenv("ALPACA_SECRET_KEY", settings.ALPACA_SECRET_KEY)
        self.base_url = os.getenv("ALPACA_BASE_URL", settings.ALPACA_BASE_URL)
        demo_mode = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")

        if self.api_key and self.secret_key and not demo_mode and "your_alpaca" not in self.api_key and "PKV7GCCHG7LIDKGOBMFFN73MJY" not in self.api_key:
            try:
                from alpaca.trading.client import TradingClient
                from alpaca.data.historical import StockHistoricalDataClient
                
                tc = TradingClient(
                    api_key=self.api_key,
                    secret_key=self.secret_key,
                    paper=True
                )
                # Verify credentials against Alpaca API
                acc = tc.get_account()
                self.trading_client = tc
                self.data_client = StockHistoricalDataClient(
                    api_key=self.api_key,
                    secret_key=self.secret_key
                )
                self.is_live_paper_available = True
                logger.info(f"Connected to Alpaca Paper Trading API (Account: {acc.account_number}).")
            except Exception as e:
                logger.warning(f"Failed to authenticate with Alpaca API ({e}). Falling back to Paper Simulation.")
                self.is_live_paper_available = False
                self.trading_client = None
                self.data_client = None
        else:
            logger.info("Using Alpaca Paper Simulation Mode (Demo).")
            self.is_live_paper_available = False

alpaca_manager = AlpacaClientManager()
