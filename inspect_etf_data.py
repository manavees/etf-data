import duckdb

# Define database file
db_file = "etf-data.duckdb"

def inspect_database():
    """
    Inspect the database to check for distinct tickers and their data counts.
    """
    conn = duckdb.connect(db_file)
    
    try:
        # Query distinct tickers and their data counts
        query = """
        SELECT ticker, COUNT(*) AS num_rows
        FROM etf_data
        GROUP BY ticker
        ORDER BY ticker
        """
        result = conn.execute(query).fetchall()

        # Print the results
        print("Database Content:")
        for row in result:
            print(f"Ticker: {row[0]}, Rows: {row[1]}")

    except Exception as e:
        print(f"Error querying database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    inspect_database()
