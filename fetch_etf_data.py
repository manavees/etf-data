import yfinance as yf
import duckdb
import json  # Add this import
from datetime import datetime

# Define database file
db_file = "etf-data.duckdb"

def fetch_existing_data(conn, ticker):
    """
    Fetch existing data for a specific ticker from DuckDB.

    Args:
        conn: DuckDB connection.
        ticker: Ticker symbol.

    Returns:
        dict: Existing date-price pairs for the ticker.
    """
    query = "SELECT date, price FROM etf_data WHERE ticker = ? ORDER BY date"
    result = conn.execute(query, [ticker]).fetchall()
    return {row[0]: row[1] for row in result}

def fetch_historical_etf_data(conn, ticker, start_date, end_date):
    """
    Fetch historical ETF data and insert it into DuckDB.
    
    Args:
        conn: DuckDB connection.
        ticker: Ticker symbol.
        start_date: Start date for the data range.
        end_date: End date for the data range.
    """
    print(f"Fetching data for {ticker} from {start_date} to {end_date}...")
    data = yf.download(ticker, start=start_date, end=end_date)
    if not data.empty:
        # Use "Adj Close" or fallback to "Close"
        column = "Adj Close" if "Adj Close" in data.columns else "Close"
        for date, price in data[column].dropna().items():
            conn.execute("""
                INSERT INTO etf_data (ticker, date, price)
                VALUES (?, ?, ?)
                ON CONFLICT (ticker, date) DO UPDATE SET price = excluded.price
            """, (ticker, date.strftime("%Y-%m-%d"), float(price)))
        print(f"Data for {ticker} updated successfully.")
    else:
        print(f"No data available for {ticker}.")

def main():
    """Main function to fetch and update ETF historical data."""
    conn = duckdb.connect(db_file)
    
    # Load tickers from etf-tickers.json
    with open("etf-tickers.json", "r") as file:
        tickers = json.load(file).get("tickers", [])
    
    end_date = datetime.now().strftime("%Y-%m-%d")
    
    for ticker in tickers:
        # Fetch existing data to determine the start date
        existing_data = fetch_existing_data(conn, ticker)
        start_date = max(existing_data.keys()) if existing_data else "1900-01-01"
        fetch_historical_etf_data(conn, ticker, start_date, end_date)
    
    conn.close()

if __name__ == "__main__":
    main()
