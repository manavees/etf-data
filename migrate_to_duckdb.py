import json
import duckdb

# File paths
json_file = "etf-data.json"
db_file = "etf-data.duckdb"

# Connect to DuckDB
conn = duckdb.connect(db_file)

# Create the ETF data table if it doesn't exist
conn.execute("""
    CREATE TABLE IF NOT EXISTS etf_data (
        ticker VARCHAR,
        date DATE,
        price DOUBLE,
        PRIMARY KEY (ticker, date)
    )
""")

# Load JSON data
try:
    with open(json_file, "r") as file:
        data = json.load(file)
    
    # Insert data into DuckDB
    for ticker, prices in data.items():
        for date, price in prices.items():
            conn.execute("""
                INSERT INTO etf_data (ticker, date, price)
                VALUES (?, ?, ?)
                ON CONFLICT (ticker, date) DO UPDATE SET price = excluded.price
            """, (ticker, date, price))
    print(f"Data from {json_file} successfully migrated to {db_file}.")
except FileNotFoundError:
    print(f"{json_file} not found. No data to migrate.")

# Close the connection
conn.close()
