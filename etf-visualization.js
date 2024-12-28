// Your existing script code for fetching and plotting data
// Add the new code for time range and dark mode

document.getElementById('time-range-select').addEventListener('change', (event) => {
  const selectedRange = event.target.value;
  const ticker = document.getElementById('ticker-select').value;
  const filteredData = filterDataByRange(data[ticker], selectedRange);
  plotData(ticker, filteredData);
});

document.getElementById('dark-mode-toggle').addEventListener('change', (event) => {
  document.body.classList.toggle('dark-mode', event.target.checked);
});
