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
      return filterData(data, cutoffDate, false); // No sampling for 1 month
    case "6m":
      cutoffDate = new Date(today.setMonth(today.getMonth() - 6));
      return filterData(data, cutoffDate, false); // No sampling for 6 months
    case "1y":
      cutoffDate = new Date(today.setFullYear(today.getFullYear() - 1));
      return filterData(data, cutoffDate, true);
    case "2y":
      cutoffDate = new Date(today.setFullYear(today.getFullYear() - 2));
      return filterData(data, cutoffDate, true);
    case "3y":
      cutoffDate = new Date(today.setFullYear(today.getFullYear() - 3));
      return filterData(data, cutoffDate, true);
    case "5y":
      cutoffDate = new Date(today.setFullYear(today.getFullYear() - 5));
      return filterData(data, cutoffDate, true);
    case "10y":
      cutoffDate = new Date(today.setFullYear(today.getFullYear() - 10));
      return filterData(data, cutoffDate, true);
    case "max":
    default:
      return sampleData(data, 300); // Max uses sampling
  }
}

function filterData(data, cutoffDate, sample) {
  const filteredData = {};
  for (const [date, price] of Object.entries(data)) {
    if (new Date(date) >= cutoffDate) {
      filteredData[date] = price;
    }
  }
  return sample ? sampleData(filteredData, 300) : filteredData;
}

function sampleData(data, maxPoints) {
  const keys = Object.keys(data);
  const values = Object.values(data);

  // Calculate the step to sample evenly spaced points
  const step = Math.ceil(keys.length / maxPoints);
  const sampledData = {};

  for (let i = 0; i < keys.length; i += step) {
    sampledData[keys[i]] = values[i];
  }

  return sampledData;
}

function plotData(ticker, data) {
  const chartContainer = document.getElementById("chart-container");
  if (!chartContainer) {
    console.error("Error: #chart-container element not found in the DOM!");
    return;
  }

  chartContainer.innerHTML = ""; // Clear any previous chart

  const canvas = document.createElement("canvas");
  canvas.id = "chart";
  chartContainer.appendChild(canvas);

  const labels = Object.keys(data);
  const prices = Object.values(data);

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
          tension: 0.4, // Smooth line for long ranges
          pointRadius: labels.length <= 200 ? 3 : 0, // Show points only for short ranges
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => {
              const date = context.label;
              const price = context.raw;
              return `Date: ${date}, Price: ${price}`;
            },
          },
        },
        legend: {
          display: true,
          labels: {
            color: getComputedStyle(document.body).getPropertyValue("--text-color"),
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
          },
          title: {
            display: true,
            text: "Date",
            color: getComputedStyle(document.body).getPropertyValue("--text-color"),
          },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue("--text-color"),
          },
        },
        y: {
          title: {
            display: true,
            text: "Price",
            color: getComputedStyle(document.body).getPropertyValue("--text-color"),
          },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue("--text-color"),
          },
        },
      },
    },
  });
}

function toggleTheme() {
  const body = document.body;
  const toggleButton = document.getElementById("theme-toggle");

  if (body.classList.contains("dark-mode")) {
    body.classList.replace("dark-mode", "light-mode");
    toggleButton.textContent = "🌙";
  } else {
    body.classList.replace("light-mode", "dark-mode");
    toggleButton.textContent = "☀️";
  }
}

async function initialize() {
  const data = await fetchData();

  const tickerSelect = document.getElementById("ticker-select");
  const rangeSelect = document.getElementById("range-select");

  // Populate ticker dropdown
  Object.keys(data).forEach((ticker) => {
    const option = document.createElement("option");
    option.value = ticker;
    option.textContent = ticker;
    tickerSelect.appendChild(option);
  });

  // Set default ticker and range
  const defaultTicker = Object.keys(data)[0];
  tickerSelect.value = defaultTicker;

  plotData(defaultTicker, filterDataByRange(data[defaultTicker], "max"));

  // Event listeners
  tickerSelect.addEventListener("change", () => {
    const selectedTicker = tickerSelect.value;
    const selectedRange = rangeSelect.value;
    plotData(selectedTicker, filterDataByRange(data[selectedTicker], selectedRange));
  });

  rangeSelect.addEventListener("change", () => {
    const selectedTicker = tickerSelect.value;
    const selectedRange = rangeSelect.value;
    plotData(selectedTicker, filterDataByRange(data[selectedTicker], selectedRange));
  });

  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
}
