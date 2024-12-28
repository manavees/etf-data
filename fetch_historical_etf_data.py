import yfinance as yf
import json
from datetime import datetime

# ETF tickers and date range
ETF_TICKERS = ["IWDA", "EMIM", "ECAR", "VHYL", "RBOT"]
START_DATE = "1900-01-01"  # Start date for historical data
END_DATE = datetime.now().strftime("%Y-%m-%d")  # End date (today)
OUTPUT_FILE = "etf_historical_data.json"

def fetch_historical_etf_data(etf_tickers, start_date, end_date):
    """Fetch historical adjusted close data for given ETFs."""
    historical_data = {}

    for ticker in etf_tickers:
        print(f"Fetching data for {ticker}...")
        data = yf.download(ticker, start=start_date, end=end_date)
        if not data.empty:
            historical_data[ticker] = data['Adj Close'].to_dict()

    return historical_data

def save_to_json(data, file_name):
    """Save the historical data to a JSON file."""
    with open(file_name, "w") as json_file:
        json.dump(data, json_file, indent=4)
    print(f"Data saved to {file_name}")

def main():
    """Main function to fetch and save historical data."""
    print("Fetching historical ETF data...")
    historical_data = fetch_historical_etf_data(ETF_TICKERS, START_DATE, END_DATE)
    save_to_json(historical_data, OUTPUT_FILE)

if __name__ == "__main__":
    main()
