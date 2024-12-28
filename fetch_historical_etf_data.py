import yfinance as yf
import json
from datetime import datetime

# ETF tickers and date range
ETF_TICKERS = ["IWDA", "EMIM", "ECAR", "VHYL", "RBOT"]
START_DATE = "1900-01-01"  # Start date for historical data
END_DATE = datetime.now().strftime("%Y-%m-%d")  # End date (today)
JSON_FILE = "etf-data.json"  # The file to update in the repository

def fetch_historical_etf_data(etf_tickers, start_date, end_date):
    """Fetch historical adjusted close data for given ETFs."""
    historical_data = {}

    for ticker in etf_tickers:
        print(f"Fetching data for {ticker}...")
        data = yf.download(ticker, start=start_date, end=end_date)
        if not data.empty:
            historical_data[ticker] = data['Adj Close'].to_dict()

    return historical_data

def update_json_file(file_name, new_data):
    """Update the JSON file with the new historical data."""
    try:
        # Load existing data
        with open(file_name, "r") as json_file:
            current_data = json.load(json_file)
    except FileNotFoundError:
        print(f"{file_name} not found. Creating a new file.")
        current_data = {}

    # Merge new data
    for ticker, values in new_data.items():
        if ticker not in current_data:
            current_data[ticker] = {}
        current_data[ticker].update(values)

    # Save the updated data
    with open(file_name, "w") as json_file:
        json.dump(current_data, json_file, indent=4)

    print(f"Data updated and saved to {file_name}")

def main():
    """Main function to fetch and update ETF historical data."""
    print("Fetching historical ETF data...")
    historical_data = fetch_historical_etf_data(ETF_TICKERS, START_DATE, END
