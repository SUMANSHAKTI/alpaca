import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.alpaca.trading import trading_service

print("Submitting BUY order for AAPL (100 shares)...")
res = trading_service.submit_order("AAPL", 100, "buy", "market")
print("Order result:", res)
