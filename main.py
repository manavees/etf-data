import os
from github import Github
import yfinance as yf
import json
from datetime import datetime

# Get the GitHub token from the environment
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
if not GITHUB_TOKEN:
    raise EnvironmentError("GITHUB_TOKEN is not set in the environment.")

# Repository details
REPO_NAME = "manavees/etf-data"  # Replace 'your_username' with your GitHub username
JSON_FILE_PATH = "etf-data.json"  # Path to the JSON file in your repository

# ETF tickers to fetch data for
ETF_TICKERS = ["SPY", "QQQ", "VOO"]

# Fetch ETF data
def fetch_etf_data(etf_tickers):
    today = datetime.now().strftime("%Y-%m-%d")
    fetched_data = {}

    for ticker in etf_tickers:
        print(f"Fetching data for {ticker}...")
        data = yf.Ticker(ticker).history(period="1d")
        if not data.empty:
            price = data["Close"].iloc[-1]
            fetched_data[ticker] = {today: price}
    
    return fetched_data

# Update the JSON file in the GitHub repository
def update_json_file(repo, file_path, new_data):
    try:
        file = repo.get_contents(file_path)
        current_data = json.loads(file.decoded_content.decode())
    except Exception as e:
        print(f"File not found, creating a new one: {e}")
        current_data = {}

    # Merge new data
    for ticker, values in new_data.items():
        if ticker not in current_data:
            current_data[ticker] = {}
        current_data[ticker].update(values)

    # Convert to JSON string
    updated_content = json.dumps(current_data, indent=4)

    # Commit changes
    if "file" in locals():
        repo.update_file(file_path, f"Update ETF data on {datetime.now().strftime('%Y-%m-%d')}", updated_content, file.sha)
    else:
        repo.create_file(file_path, "Create ETF data file", updated_content)
    print(f"File {file_path} updated successfully.")

# Main function
def main():
    g = Github(GITHUB_TOKEN)
    repo = g.get_repo(REPO_NAME)

    new_data = fetch_etf_data(ETF_TICKERS)
    update_json_file(repo, JSON_FILE_PATH, new_data)

if __name__ == "__main__":
    main()
