import duckdb
import pandas as pd
import matplotlib.pyplot as plt

# Define database file
db_file = "etf-data.duckdb"

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
    Plot historical price data for a given ETF.

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
    plt.show()

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
