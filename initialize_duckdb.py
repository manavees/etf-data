import duckdb

# Initialize the DuckDB database file
db_file = "etf-data.duckdb"
conn = duckdb.connect(db_file)

# Create the ETF data table
conn.execute("""
    CREATE TABLE IF NOT EXISTS etf_data (
        ticker VARCHAR,
        date DATE,
        price DOUBLE,
        PRIMARY KEY (ticker, date)
    )
""")

print(f"Initialized {db_file} with the necessary tables.")

# Close the connection
conn.close()
