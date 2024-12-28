const etfDataUrl = "etf-data.json";

async function fetchEtfData() {
  const response = await fetch(etfDataUrl);
  return response.json();
}

function initialize(data) {
  const tickers = Object.keys(data);
  console.log("Fetched Data:", data);
  console.log("Tickers:", tickers);

  const tickerSelect = document.getElementById("ticker-select");
  tickers.forEach((ticker) => {
    const option = document.createElement("option");
    option.value = ticker;
    option.textContent = ticker;
    tickerSelect.appendChild(option);
  });

  tickerSelect.addEventListener("change", () => {
    const selectedTicker = tickerSelect.value;
    plotData(data, selectedTicker, document.getElementById("range-select").value);
  });

  const rangeSelect = document.getElementById("range-select");
  rangeSelect.addEventListener("change", () => {
    const selectedTicker = tickerSelect.value;
    plotData(data, selectedTicker, rangeSelect.value);
  });

  // Initialize with the first ticker and max range
  plotData(data, tickers[0], "max");

  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", toggleTheme);
}

function toggleTheme() {
  const body = document.body;
  if (body.classList.contains("dark-mode")) {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
    this.textContent = "🌙";
  } else {
    body.classList.remove("light-mode");
    body.classList.add("dark-mode");
    this.textContent = "☀️";
  }
}

function plotData(data, ticker, range) {
  const chartContainer = document.getElementById("chart-container");
  chartContainer.innerHTML = ""; // Clear existing canvas

  const canvas = document.createElement("canvas");
  chartContainer.appendChild(canvas);

  const rawData = data[ticker];
  const labels = Object.keys(rawData).map((date) => new Date(date));
  const values = Object.values(rawData);

  // Filter data based on range
  const now = new Date();
  let filteredLabels = labels;
  let filteredValues = values;

  if (range !== "max") {
    const rangeMap = {
      "10y": 10,
      "5y": 5,
      "4y": 4,
      "3y": 3,
      "2y": 2,
      "1y": 1,
      "6m": 0.5,
      "1m": 1 / 12,
    };
    const cutoff = new Date(now);
    cutoff.setFullYear(now.getFullYear() - (rangeMap[range] || 0));
    cutoff.setMonth(now.getMonth() - (range === "6m" ? 6 : 0));
    filteredLabels = labels.filter((date) => date >= cutoff);
    filteredValues = values.slice(labels.length - filteredLabels.length);
  }

  new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: filteredLabels,
      datasets: [
        {
          label: ticker,
          data: filteredValues,
          borderColor: "#4caf50",
          borderWidth: 2,
          fill: false,
          tension: 0.4, // Smoothing
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "month",
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
    },
  });
}

fetchEtfData().then(initialize);
