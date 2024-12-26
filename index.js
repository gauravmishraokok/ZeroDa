const transactions = [];

async function fetchTransactions() {
  const response = await fetch('http://localhost:5000/transactions');
  const data = await response.json();
  transactions.push(...data);
  updateDOM();
  updateBalance();
  updateIncomeExpenses();
  updateChart();
}

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = document.getElementById('text').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  if (text === '' || isNaN(amount) || date === '') {
    alert('Please add a text, amount, and date');
  } else {
    const transaction = {
      text,
      amount: category === 'income' ? Math.abs(amount) : -Math.abs(amount),
      category,
      date: new Date(date),
    };

    const response = await fetch('http://localhost:5000/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });

    const newTransaction = await response.json();
    transactions.push(newTransaction);
    updateDOM();
    updateBalance();
    updateIncomeExpenses();
    updateChart();
    document.getElementById('form').reset();
  }
});

function removeTransaction(id) {
  fetch(`http://localhost:5000/transactions/${id}`, {
    method: 'DELETE',
  }).then(() => {
    const index = transactions.findIndex(transaction => transaction._id === id);
    if (index !== -1) {
      transactions.splice(index, 1);
      updateDOM();
      updateBalance();
      updateIncomeExpenses();
      updateChart();
    }
  });
}

function updateDOM(transactionsToDisplay = transactions) {
  const list = document.getElementById('list');
  list.innerHTML = '';

  // Sort transactions by date in ascending order
  transactionsToDisplay.sort((a, b) => new Date(a.date) - new Date(b.date));

  transactionsToDisplay.forEach(addTransactionDOM);
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');

  // Capitalize the first letter of the category
  const category = transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1);

  // Format the date to "1 Dec 2024"
  const formattedDate = new Date(transaction.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const aiAssistedText = transaction.aiAssisted ? '<span style="color: #16a085; font-size: 0.8em;">*AI Assisted</span>' : '';

  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.innerHTML = `
    <div style="display: flex; flex-direction: column; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.2em; font-weight: bold;">
        <span>${transaction.text} ${aiAssistedText}</span>
        <span>${sign} &#8377; ${Math.abs(transaction.amount)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9em;">
        <span style="color: black;">${category}</span>
        <span style="color: black;">${formattedDate}</span>
      </div>
    </div>
    <button class="delete-btn" onclick="removeTransaction('${transaction._id}')">
      <i data-lucide="badge-x" class="lucide"></i>
    </button>
  `;

  document.getElementById('list').prepend(item);
}






function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}




function updateBalance() {
  const balance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
  document.getElementById('balance').innerHTML = `&#8377;${balance.toFixed(2)}`;
}

function updateIncomeExpenses() {
  const amounts = transactions.map(transaction => transaction.amount);
  const income = amounts
    .filter(amount => amount > 0)
    .reduce((acc, amount) => acc + amount, 0);
  const expense = amounts
    .filter(amount => amount < 0)
    .reduce((acc, amount) => acc + amount, 0) * -1;

  document.getElementById('money-plus').innerHTML = `+&#8377;${income.toFixed(2)}`;
  document.getElementById('money-minus').innerHTML = `-&#8377;${expense.toFixed(2)}`;
  lucide.createIcons();
}

function filterTransactions() {
  const filterValue = document.getElementById('filter').value;
  const frequencyValue = document.getElementById('frequency').value;
  const now = new Date();

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);

    // Filter by type
    const typeMatch = (filterValue === 'all') ||
                      (filterValue === 'income' && transaction.amount > 0) ||
                      (filterValue === 'expense' && transaction.amount < 0);

    // Filter by frequency
    let frequencyMatch = true;
    if (frequencyValue === 'last-week') {
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      frequencyMatch = transactionDate >= lastWeek;
    } else if (frequencyValue === 'last-month') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      frequencyMatch = transactionDate >= lastMonth;
    } else if (frequencyValue === 'last-year') {
      const lastYear = new Date(now);
      lastYear.setFullYear(now.getFullYear() - 1);
      frequencyMatch = transactionDate >= lastYear;
    } else if (frequencyValue === 'custom') {
      // Implement custom range logic here
      // For example, prompt user for start and end dates
    }

    return typeMatch && frequencyMatch;
  });

  updateDOM(filteredTransactions);
}

// Add event listener for frequency dropdown
document.getElementById('frequency').addEventListener('change', filterTransactions);



// Initialize the app
function init() {
  fetchTransactions();
  lucide.createIcons();

  // Add event listener for filter dropdown
  document.getElementById('filter').addEventListener('change', filterTransactions);
}

init();
