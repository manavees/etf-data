import yfinance as yf
import json
from datetime import datetime
from github import Github

# Replace with your GitHub token (generate at https://github.com/settings/tokens)
GITHUB_TOKEN = "your_github_token_here"
REPO_NAME = "your_username/etf-data"  # e.g., "your_username/etf-data"
JSON_FILE_PATH = "etf_data.json"  # Path to the JSON file in your repo

# List of ETF tickers
ETF_TICKERS = ["SPY", "QQQ", "VOO"]  # Example ETFs

# Fetch ETF data for the current day
def fetch_etf_data(etf_tickers):
    today = datetime.now().strftime("%Y-%m-%d")
    fetched_data = {}

    for ticker in etf_tickers:
        print(f"Fetching data for {ticker}...")
        data = yf.Ticker(ticker).history(period="1d")  # Fetch today's data
        if not data.empty:
            price = data["Close"].iloc[-1]
            fetched_data[ticker] = {today: price}
    
    return fetched_data

# Update the JSON file with new data
def update_json_file(repo, file_path, new_data):
    # Get the current content of the JSON file
    file = repo.get_contents(file_path)
    current_data = json.loads(file.decoded_content.decode())

    # Merge new data into current data
    for ticker, values in new_data.items():
        if ticker not in current_data:
            current_data[ticker] = {}
        current_data[ticker].update(values)

    # Convert updated data back to JSON
    updated_content = json.dumps(current_data, indent=4)

    # Commit the updated file back to GitHub
    repo.update_file(
        file_path,
        f"Update ETF data for {datetime.now().strftime('%Y-%m-%d')}",
        updated_content,
        file.sha
    )
    print(f"Updated {file_path} in the repository.")

# Main function
def main():
    # Authenticate with GitHub
    g = Github(GITHUB_TOKEN)
    repo = g.get_repo(REPO_NAME)

    # Fetch new ETF data
    new_data = fetch_etf_data(ETF_TICKERS)

    # Update the JSON file in the GitHub repository
    update_json_file(repo, JSON_FILE_PATH, new_data)

if __name__ == "__main__":
    main()
