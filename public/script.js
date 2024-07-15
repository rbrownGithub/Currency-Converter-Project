// API key and base URL
const API_KEY = 'fca_live_mJ618wYSMvTEyEtzF7bO37fOAS6UTY6az12zA7j9';
const BASE_URL = 'https://api.freecurrencyapi.com/v1';
const SERVER_URL = 'http://localhost:3000';
// DOM elements
const baseCurrencySelect = document.getElementById('base-currency');
const targetCurrencySelect = document.getElementById('target-currency');
const amountInput = document.getElementById('amount');
const convertedAmountSpan = document.getElementById('converted-amount');
const historicalRatesButton = document.getElementById('historical-rates');
const historicalRatesContainer = document.getElementById('historical-rates-container');
const saveFavoriteButton = document.getElementById('save-favorite');
const favoriteCurrencyPairsContainer = document.getElementById('favorite-currency-pairs');

// Fetch available currencies and populate dropdowns
async function fetchCurrencies() {
    try {
      const response = await fetch(`${BASE_URL}/currencies`, {
        headers: { apikey: API_KEY }
      });
      const data = await response.json();
      console.log('Currencies:', data); // Log the currencies data
  
      if (data.data) {
        const currencies = Object.keys(data.data);
        populateDropdown(baseCurrencySelect, currencies);
        populateDropdown(targetCurrencySelect, currencies);
      } else {
        throw new Error('Unexpected API response structure for currencies');
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  }
  
  function populateDropdown(select, currencies) {
    select.innerHTML = '';
    currencies.forEach(currency => {
      const option = document.createElement('option');
      option.value = currency;
      option.textContent = currency;
      select.appendChild(option);
    });
  }
  
  // Call this function when the page loads
  fetchCurrencies();

// Convert currency
async function convertCurrency() {
    const baseCurrency = baseCurrencySelect.value;
    const targetCurrency = targetCurrencySelect.value;
    const amount = parseFloat(amountInput.value);
  
    if (isNaN(amount) || amount < 0) {
      alert('Please enter a valid positive number for the amount.');
      return;
    }
  
    try {
      const response = await fetch(`${BASE_URL}/latest?base_currency=${baseCurrency}&currencies=${targetCurrency}`, {
        headers: { apikey: API_KEY }
      });
  
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('API Response:', data); // Log the entire response
  
      if (data.data && data.data[targetCurrency]) {
        const rate = data.data[targetCurrency];
        const convertedAmount = amount * rate;
        convertedAmountSpan.textContent = `${convertedAmount.toFixed(2)} ${targetCurrency}`;
      } else {
        throw new Error('Unexpected API response structure');
      }
    } catch (error) {
      console.error('Error converting currency:', error);
      convertedAmountSpan.textContent = 'Error: Unable to convert currency';
    }
  }

// Fetch historical rates
async function fetchHistoricalRates() {
  const baseCurrency = baseCurrencySelect.value;
  const targetCurrency = targetCurrencySelect.value;
  const date = new Date();
  date.setDate(date.getDate() - 7); // 7 days ago
  const formattedDate = date.toISOString().split('T')[0];

  try {
    const response = await fetch(`${BASE_URL}/historical?date=${formattedDate}&base_currency=${baseCurrency}&currencies=${targetCurrency}`, {
      headers: { apikey: API_KEY }
    });
    const data = await response.json();
    const rate = data.data[formattedDate][targetCurrency];
    historicalRatesContainer.textContent = `Historical exchange rate on ${formattedDate}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`;
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    alert('An error occurred while fetching historical rates. Please try again later.');
  }
}

// Save favorite currency pair
async function saveFavoritePair() {
    const baseCurrency = baseCurrencySelect.value;
    const targetCurrency = targetCurrencySelect.value;
  
    try {
        console.log('Attempting to save favorite pair:', { baseCurrency, targetCurrency });  
        const response = await fetch(`${SERVER_URL}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseCurrency, targetCurrency })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Favorite pair saved:', data);
      fetchFavoritePairs();
    } catch (error) {
      console.error('Error saving favorite pair:', error);
      alert(`An error occurred while saving the favorite pair: ${error.message}`);
    }
  }

// Fetch and display favorite currency pairs
async function fetchFavoritePairs() {
  try {
    const response = await fetch('/api/favorites');
    const favoritePairs = await response.json();
    favoriteCurrencyPairsContainer.innerHTML = '';
    favoritePairs.forEach(pair => {
      const pairDiv = document.createElement('div');
      pairDiv.className = 'favorite-pair';
      
      const pairButton = document.createElement('button');
      pairButton.textContent = `${pair.baseCurrency}/${pair.targetCurrency}`;
      pairButton.addEventListener('click', () => {
        baseCurrencySelect.value = pair.baseCurrency;
        targetCurrencySelect.value = pair.targetCurrency;
        convertCurrency();
      });
      
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete-button';
      deleteButton.addEventListener('click', () => deleteFavoritePair(pair.id));
      
      pairDiv.appendChild(pairButton);
      pairDiv.appendChild(deleteButton);
      favoriteCurrencyPairsContainer.appendChild(pairDiv);
    });
  } catch (error) {
    console.error('Error fetching favorite pairs:', error);
  }
}

async function deleteFavoritePair(id) {
  try {
    const response = await fetch(`/api/favorites/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      fetchFavoritePairs(); // Refresh the list after deletion
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
  } catch (error) {
    console.error('Error deleting favorite pair:', error);
    alert('Failed to delete favorite pair. Please try again.');
  }
}

// Event listeners
baseCurrencySelect.addEventListener('change', convertCurrency);
targetCurrencySelect.addEventListener('change', convertCurrency);
amountInput.addEventListener('input', convertCurrency);
historicalRatesButton.addEventListener('click', fetchHistoricalRates);
saveFavoriteButton.addEventListener('click', saveFavoritePair);

// Initialize the app
fetchCurrencies();
fetchFavoritePairs();