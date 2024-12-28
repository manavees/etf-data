import yfinance as yf
import json
from datetime import datetime

# Define file names
TICKERS_FILE = "etf-tickers.json"
DATA_FILE = "etf-data.json"
DEFAULT_START_DATE = "1950-01-01"  # Default start date if no data exists

def load_etf_tickers(file_name):
    """Load ETF tickers from a JSON file."""
    try:
        with open(file_name, "r") as file:
            data = json.load(file)
            return data.get("tickers", [])
    except FileNotFoundError:
        print(f"Error: {file_name} not found. Please ensure the file exists.")
        return []

def get_latest_date_from_file(file_name):
    """
    Get the latest date from the existing JSON file.

    Args:
        file_name (str): The name of the JSON file to read.

    Returns:
        str: The latest date in the file, formatted as 'YYYY-MM-DD'.
             If the file doesn't exist or is invalid, returns DEFAULT_START_DATE.
    """
    try:
        # Load the JSON file
        with open(file_name, "r") as json_file:
            current_data = json.load(json_file)

        # Extract the latest date for each ETF
        latest_dates = [
            max(datetime.strptime(date, "%Y-%m-%d") for date in data.keys())
            for data in current_data.values()
        ]

        # Return the latest date across all ETFs
        return max(latest_dates).strftime("%Y-%m-%d")

    except (FileNotFoundError, ValueError):
        # Default to DEFAULT_START_DATE if the file is missing or invalid
        print(f"{file_name} not found or invalid. Defaulting to DEFAULT_START_DATE.")
        return DEFAULT_START_DATE

def fetch_historical_etf_data(etf_tickers, start_date, end_date):
    """Fetch historical adjusted close or close data for given ETFs."""
    historical_data = {}

    for ticker in etf_tickers:
        try:
            print(f"Fetching data for {ticker} from {start_date} to {end_date}...")
            data = yf.download(ticker, start=start_date, end=end_date)

            if not data.empty:
                if "Adj Close" in data.columns:
                    # Convert the index (dates) to strings and values to floats
                    historical_data[ticker] = {
                        (date.strftime("%Y-%m-%d") if hasattr(date, "strftime") else str(date)): float(price)
                        for date, price in data['Adj Close'].items()
                    }
                elif "Close" in data.columns:
                    # Convert the index (dates) to strings and values to floats
                    historical_data[ticker] = {
                        (date.strftime("%Y-%m-%d") if hasattr(date, "strftime") else str(date)): float(price)
                        for date, price in data['Close'].items()
                    }
                else:
                    print(f"Warning: No 'Adj Close' or 'Close' data found for {ticker}. Skipping.")
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
        # Ensure all keys are strings and all values are JSON-serializable
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

    start_date = get_latest_date_from_file(DATA_FILE)
    end_date = datetime.now().strftime("%Y-%m-%d")

    print("Fetching historical ETF data...")
    historical_data = fetch_historical_etf_data(etf_tickers, start_date, end_date)

    if historical_data:
        update_json_file(DATA_FILE, historical_data)
    else:
        print("No valid data fetched. Exiting without updating the file.")


if __name__ == "__main__":
    main()
