// Fetch the JSON data and initialize visualization
async function fetchData() {
  const response = await fetch("etf-data.json");
  const data = await response.json();
  return data;
}

// Filter data based on the selected time range
function filterDataByRange(data, range) {
  const now = new Date();
  const dateKeys = Object.keys(data).sort();

  let filteredKeys;
  switch (range) {
    case "1m":
      filteredKeys = dateKeys.filter(
        (date) => new Date(date) >= new Date(now.setMonth(now.getMonth() - 1))
      );
      break;
    case "3m":
      filteredKeys = dateKeys.filter(
        (date) => new Date(date) >= new Date(now.setMonth(now.getMonth() - 3))
      );
      break;
    case "1y":
      filteredKeys = dateKeys.filter(
        (date) => new Date(date) >= new Date(now.setFullYear(now.getFullYear() - 1))
      );
      break;
    default:
      filteredKeys = dateKeys; // Max range
  }

  return filteredKeys.reduce((obj, key) => {
    obj[key] = data[key];
    return obj;
  }, {});
}

// Plot data on the chart
function plotData(ticker, data) {
  const ctx = document.getElementById("etf-chart").getContext("2d");

  // Destroy the existing chart if it exists
  if (window.etfChart) {
    window.etfChart.destroy();
  }

  const labels = Object.keys(data);
  const prices = Object.values(data);

  window.etfChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `${ticker} Price`,
          data: prices,
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "month",
          },
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "Price (USD)",
          },
        },
      },
    },
  });
}

// Initialize the application
async function initialize() {
  const data = await fetchData();

  const tickerSelect = document.getElementById("ticker-select");
  const timeRangeSelect = document.getElementById("time-range-select");

  // Populate the ticker dropdown
  Object.keys(data).forEach((ticker) => {
    const option = document.createElement("option");
    option.value = ticker;
    option.textContent = ticker;
    tickerSelect.appendChild(option);
  });

  // Default ticker
  const defaultTicker = Object.keys(data)[0];
  plotData(defaultTicker, data[defaultTicker]);

  // Add event listeners for dropdowns
  tickerSelect.addEventListener("change", () => {
    const selectedTicker = tic
