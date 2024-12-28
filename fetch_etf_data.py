import yfinance as yf
import pandas as pd
import json
from datetime import datetime

# Define file names
TICKERS_FILE = "etf-tickers.json"
DATA_FILE = "etf-data.json"
DEFAULT_START_DATE = "1900-01-01"  # Fetch data since 1900

def load_etf_tickers(file_name):
    """Load ETF tickers from a JSON file."""
    try:
        with open(file_name, "r") as file:
            data = json.load(file)
            return data.get("tickers", [])
    except FileNotFoundError:
        print(f"Error: {file_name} not found. Please ensure the file exists.")
        return []

def get_missing_start_date(ticker, current_data):
    """
    Determine the missing date range for an existing ticker.

    Args:
        ticker (str): The ticker symbol.
        current_data (dict): The existing data from etf-data.json.

    Returns:
        str: The earliest missing date for the ticker.
    """
    if ticker in current_data and current_data[ticker]:
        # Check if data exists starting from DEFAULT_START_DATE
        available_dates = sorted(datetime.strptime(date, "%Y-%m-%d") for date in current_data[ticker].keys())
        first_available_date = available_dates[0]
        if first_available_date > datetime.strptime(DEFAULT_START_DATE, "%Y-%m-%d"):
            # If the first available date is after DEFAULT_START_DATE, return DEFAULT_START_DATE
            return DEFAULT_START_DATE
        else:
            # Otherwise, fetch data from the latest available date
            latest_date = max(available_dates)
            return latest_date.strftime("%Y-%m-%d")
    else:
        # For new tickers, fetch from DEFAULT_START_DATE
        return DEFAULT_START_DATE

def fetch_historical_etf_data(etf_tickers, current_data, end_date):
    """Fetch historical adjusted close or close data for given ETFs."""
    historical_data = {}
    for ticker in etf_tickers:
        start_date = get_missing_start_date(ticker, current_data)
        try:
            print(f"Fetching data for {ticker} from {start_date} to {end_date}...")
            data = yf.download(ticker, start=start_date, end=end_date)
            print(f"Raw data for {ticker}:\n{data}")  # Debugging output

            if not data.empty:
                # Extract the "Adj Close" or "Close" column
                if "Adj Close" in data.columns:
                    selected_data = data["Adj Close"]
                elif "Close" in data.columns:
                    selected_data = data["Close"]
                else:
                    print(f"Warning: No 'Adj Close' or 'Close' column found for {ticker}. Skipping.")
                    continue

                # Convert the data to the desired format
                historical_data[ticker] = {
                    date.strftime("%Y-%m-%d"): float(price)
                    for date, price in zip(selected_data.index, selected_data.values)
                    if not pd.isna(price)
                }
            else:
                print(f"Warning: No data returned for {ticker}. Skipping.")
        except Exception as e:
            print(f"Error fetching data for {ticker}: {e}")
    return historical_data

def update_json_file(file_name, new_data):
    """Update the JSON file with the new historical data."""
    try:
        with open(file_name, "r") as json_file:
            current_data = json.load(json_file)
    except FileNotFoundError:
        print(f"{file_name} not found. Creating a new file.")
        current_data = {}

    # Merge new data into the current data
    for ticker, values in new_data.items():
        if ticker not in current_data:
            current_data[ticker] = {}
        current_data[ticker].update({
            str(k): float(v) for k, v in values.items()
        })

    # Save the updated data
    with open(file_name, "w") as json_file:
        json.dump(current_data, json_file, indent=4)

    print(f"Data updated and saved to {file_name}")

def main():
    """Main function to fetch and update ETF historical data."""
    etf_tickers = load_etf_tickers(TICKERS_FILE)
    if not etf_tickers:
        print("No tickers found. Exiting.")
        return

    # Load current data from etf-data.json
    try:
        with open(DATA_FILE, "r") as json_file:
            current_data = json.load(json_file)
    except FileNotFoundError:
        current_data = {}

    end_date = datetime.now().strftime("%Y-%m-%d")
    print("Fetching historical ETF data...")
    historical_data = fetch_historical_etf_data(etf_tickers, current_data, end_date)
    print("Fetched data:", historical_data)  # Debugging output

    if historical_data:
        update_json_file(DATA_FILE, historical_data)
    else:
        print("No valid data fetched. Exiting without updating the file.")

if __name__ == "__main__":
    main()
