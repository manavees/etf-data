document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "etf-data.json";
    const chartContainer = document.getElementById("chart-container");
    const tickerSelector = document.getElementById("ticker-selector");
    const rangeSelector = document.getElementById("range-selector");
    const themeToggle = document.getElementById("theme-toggle");

    let currentChart;

    async function fetchData() {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log("Fetched Data:", data);
        return data;
    }

    function plotData(data, ticker, range) {
        if (currentChart) {
            currentChart.destroy();
        }

        const labels = [];
        const prices = [];

        const startDate = calculateStartDate(range);

        for (const [date, price] of Object.entries(data[ticker])) {
            const parsedDate = new Date(date);
            if (parsedDate >= startDate) {
                labels.push(date);
                prices.push(price);
            }
        }

        const ctx = document.createElement("canvas");
        chartContainer.innerHTML = "";
        chartContainer.appendChild(ctx);

        currentChart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: ticker,
                        data: prices,
                        borderColor: "rgba(75, 192, 192, 1)",
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        borderWidth: 2, // Default thickness
                        pointRadius: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        enabled: true,
                    },
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: "#000", // Static color for axes
                        },
                        grid: {
                            display: false,
                        },
                    },
                    y: {
                        ticks: {
                            color: "#000",
                        },
                        grid: {
                            color: "#e0e0e0",
                        },
                    },
                },
            },
        });
    }

    function calculateStartDate(range) {
        const today = new Date();
        switch (range) {
            case "1M":
                return new Date(today.setMonth(today.getMonth() - 1));
            case "6M":
                return new Date(today.setMonth(today.getMonth() - 6));
            case "1Y":
                return new Date(today.setFullYear(today.getFullYear() - 1));
            case "2Y":
                return new Date(today.setFullYear(today.getFullYear() - 2));
            case "3Y":
                return new Date(today.setFullYear(today.getFullYear() - 3));
            case "5Y":
                return new Date(today.setFullYear(today.getFullYear() - 5));
            case "10Y":
                return new Date(today.setFullYear(today.getFullYear() - 10));
            default:
                return new Date(1900, 0, 1);
        }
    }

    function initialize(data) {
        const tickers = Object.keys(data);
        console.log("Tickers:", tickers);

        tickerSelector.innerHTML = tickers
            .map((ticker) => `<option value="${ticker}">${ticker}</option>`)
            .join("");

        tickerSelector.addEventListener("change", () => {
            const selectedTicker = tickerSelector.value;
            const selectedRange = rangeSelector.value;
            plotData(data, selectedTicker, selectedRange);
        });

        rangeSelector.addEventListener("change", () => {
            const selectedTicker = tickerSelector.value;
            const selectedRange = rangeSelector.value;
            plotData(data, selectedTicker, selectedRange);
        });

        // Initialize with the first ticker and default range
        plotData(data, tickers[0], "1M");
    }

    const data = await fetchData();
    initialize(data);
});
