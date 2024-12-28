import duckdb
import pandas as pd
import matplotlib.pyplot as plt
import os

# Define database file
db_file = "etf-data.duckdb"
plots_dir = "plots"

def fetch_data_for_visualization(ticker):
    """
    Fetch historical data for the given ticker from DuckDB.

    Args:
        ticker (str): Ticker symbol.

    Returns:
        pd.DataFrame: DataFrame containing date and price.
    """
    conn = duckdb.connect(db_file)
    query = f"""
    SELECT date, price FROM etf_data
    WHERE ticker = '{ticker}'
    ORDER BY date
    """
    data = conn.execute(query).fetchdf()
    conn.close()
    return data

def plot_etf_data(ticker, data):
    """
    Plot historical price data for a given ETF and save it as an image.

    Args:
        ticker (str): Ticker symbol.
        data (pd.DataFrame): DataFrame containing date and price.
    """
    plt.figure(figsize=(10, 6))
    plt.plot(pd.to_datetime(data["date"]), data["price"], label=ticker, marker='o')
    plt.title(f"Historical Prices for {ticker}")
    plt.xlabel("Date")
    plt.ylabel("Price")
    plt.legend()
    plt.grid()
    
    # Ensure plots directory exists
    os.makedirs(plots_dir, exist_ok=True)
    
    # Save the plot as a file
    plot_file = os.path.join(plots_dir, f"{ticker}.png")
    plt.savefig(plot_file)
    print(f"Saved plot for {ticker} to {plot_file}")

def main():
    # Tickers to visualize
    tickers = ["IWDA.AS", "EMIM.AS", "ECAR.AS"]

    for ticker in tickers:
        print(f"Visualizing data for {ticker}...")
        data = fetch_data_for_visualization(ticker)
        if not data.empty:
            plot_etf_data(ticker, data)
        else:
            print(f"No data found for {ticker}.")

if __name__ == "__main__":
    main()
