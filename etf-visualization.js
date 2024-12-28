document.addEventListener("DOMContentLoaded", initialize);

async function fetchData() {
  try {
    const response = await fetch("etf-data.json");
    if (!response.ok) throw new Error("Failed to fetch etf-data.json");
    const data = await response.json();
    console.log("Fetched Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return {};
  }
}

function filterDataByRange(data, range) {
  const today = new Date();
  let cutoffDate;

  switch (range) {
    case "1m":
      cutoffDate = new Date(today.setMonth(today.getMonth() - 1));
      break;
    case "6m":
      cutoffDate = new Date(today.setMonth(today.getMonth() - 6));
      break;
    case "1y":
      cutoffDate = new Date(today.setFullYear(today.getFullYear() - 1));
      break;
    case "max":
    default:
      return data; // Return all data
  }

  // Filter data by date
  const filteredData = {};
  for (const [date, price] of Object.entries(data)) {
    if (new Date(date) >= cutoffDate) {
      filteredData[date] = price;
    }
  }
  return filteredData;
}

function plotData(ticker, data) {
  const labels = Object.keys(data);
  const prices = Object.values(data);

  const chartContainer = document.getElementById("chart-container");
  chartContainer.innerHTML = ""; // Clear any previous chart

  const canvas = document.createElement("canvas");
  canvas.id = "chart";
  chartContainer.appendChild(canvas);

  new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `${ticker} Price`,
          data: prices,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
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
            text: "Price",
          },
        },
      },
    },
  });
}

async function initialize() {
  const data = await fetchData();

  const tickerSelect = document.getElementById("ticker-select");
  const rangeSelect = document.getElementById("range-select");

  if (Object.keys(data).length === 0) {
    console.error("No tickers found in the fetched data!");
    return;
  }

  // Populate the ticker dropdown
  Object.keys(data).forEach((ticker) => {
    const option = document.createElement("option");
    option.value = ticker;
    option.textContent = ticker;
    tickerSelect.appendChild(option);
  });

  console.log("Tickers:", Object.keys(data));

  // Default to the first ticker
  const defaultTicker = Object.keys(data)[0];
  const defaultRange = "max";
  const filteredData = filterDataByRange(data[defaultTicker], defaultRange);
  plotData(defaultTicker, filteredData);

  // Add event listeners for dropdowns
  tickerSelect.addEventListener("change", () => {
    const selectedTicker = tickerSelect.value;
    const selectedRange = rangeSelect.value;
    const filteredData = filterDataByRange(data[selectedTicker], selectedRange);
    plotData(selectedTicker, filteredData);
  });

  rangeSelect.addEventListener("change", () => {
    const selectedTicker = tickerSelect.value;
    const selectedRange = rangeSelect.value;
    const filteredData = filterDataByRange(data[selectedTicker], selectedRange);
    plotData(selectedTicker, filteredData);
  });
}
