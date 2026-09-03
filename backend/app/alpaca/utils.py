"""
Symbol Normalization Utilities for Alpha Hunter.
"""

def normalize_symbol(symbol: str) -> str:
    """
    Normalizes symbols for consistent UI and backend processing.
    Examples:
        'BTC/USD' -> 'BTCUSD'
        'btc-usd' -> 'BTCUSD'
        'aapl'    -> 'AAPL'
    """
    if not symbol:
        return ""
    clean = symbol.strip().upper().replace("/", "").replace("-", "")
    return clean
