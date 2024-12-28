const chartContainer = document.getElementById("chart-container");
const tickerSelect = document.getElementById("ticker-select");
const rangeSelect = document.getElementById("range-select");
const themeToggle = document.getElementById("theme-toggle");
let chartInstance;

// Fetch ETF data and initialize the visualization
async function initialize() {
  const response = await fetch("etf-data.json");
  const data = await response.json();

  console.log("Fetched Data:", data);

  const tickers = Object.keys(data);
  console.log("Tickers:", tickers);

  // Populate the dropdown with tickers
  tickerSelect.innerHTML = tickers
    .map((ticker) => `<option value="${ticker}">${ticker}</option>`)
    .join("");

  // Default ticker selection
  const defaultTicker = tickers[0];
  tickerSelect.value = defaultTicker;

  // Plot the default ticker data
  plotData(data, defaultTicker, "max");

  // Add event listeners
  tickerSelect.addEventListener("change", () =>
    plotData(data, tickerSelect.value, rangeSelect.value)
  );
  rangeSelect.addEventListener("change", () =>
    plotData(data, tickerSelect.value, rangeSelect.value)
  );
}

// Plot data for the selected ticker and range
function plotData(data, ticker, range) {
  if (chartInstance) chartInstance.destroy();

  const rangeStart = getRangeStart(range);
  const filteredData = Object.entries(data[ticker])
    .map(([date, price]) => ({ x: new Date(date), y: parseFloat(price).toFixed(2) }))
    .filter((item) => item.x >= rangeStart);

  const ctx = document.createElement("canvas");
  chartContainer.innerHTML = "";
  chartContainer.appendChild(ctx);

  // Determine the time unit for x-axis labels
  const timeUnit = range === "1m" ? "day" : range === "6m" ? "week" : "month";

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: ticker,
          data: filteredData,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 3, // Increased line thickness
          tension: 0.3,
          pointRadius: 0,
          hoverRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: timeUnit,
          },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue("--text-color"),
          },
        },
        y: {
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue("--text-color"),
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: getComputedStyle(document.body).getPropertyValue("--text-color"),
          },
        },
      },
    },
  });
}

// Get range start date
function getRangeStart(range) {
  const now = new Date();
  switch (range) {
    case "1m":
      return new Date(now.setMonth(now.getMonth() - 1));
    case "6m":
      return new Date(now.setMonth(now.getMonth() - 6));
    case "1y":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case "2y":
      return new Date(now.setFullYear(now.getFullYear() - 2));
    case "3y":
      return new Date(now.setFullYear(now.getFullYear() - 3));
    case "4y":
      return new Date(now.setFullYear(now.getFullYear() - 4));
    case "5y":
      return new Date(now.setFullYear(now.getFullYear() - 5));
    case "10y":
      return new Date(now.setFullYear(now.getFullYear() - 10));
    case "max":
    default:
      return new Date("1900-01-01");
  }
}

// Toggle dark/light mode
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
  themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";

  // Update axis and legend colors
  if (chartInstance) {
    chartInstance.options.scales.x.ticks.color = getComputedStyle(
      document.body
    ).getPropertyValue("--text-color");
    chartInstance.options.scales.y.ticks.color = getComputedStyle(
      document.body
    ).getPropertyValue("--text-color");
    chartInstance.options.plugins.legend.labels.color = getComputedStyle(
      document.body
    ).getPropertyValue("--text-color");
    chartInstance.update();
  }
});

// Initialize the visualization
initialize();
