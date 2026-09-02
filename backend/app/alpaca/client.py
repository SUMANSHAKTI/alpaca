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
        load_dotenv(override=True)
        import os
        self.api_key = os.getenv("ALPACA_API_KEY", settings.ALPACA_API_KEY)
        self.secret_key = os.getenv("ALPACA_SECRET_KEY", settings.ALPACA_SECRET_KEY)
        self.base_url = os.getenv("ALPACA_BASE_URL", settings.ALPACA_BASE_URL)
        demo_mode = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")

        if self.api_key and self.secret_key and not demo_mode and "your_alpaca" not in self.api_key:
            try:
                from alpaca.trading.client import TradingClient
                from alpaca.data.historical import StockHistoricalDataClient
                
                self.trading_client = TradingClient(
                    api_key=self.api_key,
                    secret_key=self.secret_key,
                    paper=True
                )
                self.data_client = StockHistoricalDataClient(
                    api_key=self.api_key,
                    secret_key=self.secret_key
                )
                self.is_live_paper_available = True
                logger.info("Connected to Alpaca Paper Trading API.")
            except Exception as e:
                logger.warning(f"Failed to initialize live Alpaca client: {e}. Falling back to Paper Simulation.")
                self.is_live_paper_available = False
        else:
            logger.info("Using Alpaca Paper Simulation Mode (Demo).")
            self.is_live_paper_available = False

alpaca_manager = AlpacaClientManager()
