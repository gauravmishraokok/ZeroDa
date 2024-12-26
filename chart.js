let chart, categoryChart, trendChart;

async function fetchTransactions() {
  const response = await fetch('http://localhost:5000/transactions');
  const transactions = await response.json();
  updateCharts(transactions);
}

function updateCharts(transactions) {
  // Main Income vs Expense Chart
  const ctx = document.getElementById('expenditureChart').getContext('2d');
  const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#2ecc71', '#c0392b'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Income vs Expense'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `₹${context.raw.toFixed(2)}`;
            }
          }
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  });

  // Category Chart
  const categoryCtx = document.getElementById('categoryChart').getContext('2d');
  const categories = transactions.reduce((acc, transaction) => {
    if (transaction.category !== 'income') {
      acc[transaction.category] = (acc[transaction.category] || 0) + Math.abs(transaction.amount);
    }
    return acc;
  }, {});

  if (categoryChart) {
    categoryChart.destroy();
  }

  // Create color palette for categories
  const colorPalette = [
    '#453596', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6',
    '#3498db', '#e67e22', '#1abc9c', '#34495e', '#7f8c8d'
  ];

  categoryChart = new Chart(categoryCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        label: 'Expenditure by Category',
        data: Object.values(categories),
        backgroundColor: Object.keys(categories).map((_, i) => colorPalette[i % colorPalette.length]),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Expenditure by Category'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `₹${context.raw.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value;
            }
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart'
      },
      hover: {
        mode: 'nearest',
        intersect: false,
        animationDuration: 200
      }
    }
  });

  // Add Spending Trend Chart
  const trendCtx = document.createElement('canvas');
  trendCtx.id = 'trendChart';
  document.querySelector('.container').insertBefore(trendCtx, document.querySelector('.btn'));

  // Group transactions by date
  const dailyTotals = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + (transaction.amount < 0 ? Math.abs(transaction.amount) : 0);
    return acc;
  }, {});

  const sortedDates = Object.keys(dailyTotals).sort((a, b) => new Date(a) - new Date(b));

  if (trendChart) {
    trendChart.destroy();
  }

  trendChart = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: sortedDates,
      datasets: [{
        label: 'Daily Spending Trend',
        data: sortedDates.map(date => dailyTotals[date]),
        borderColor: '#453596',
        backgroundColor: 'rgba(69, 53, 150, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Spending Trend Over Time'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `₹${context.raw.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value;
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart'
      }
    }
  });
}

fetchTransactions();
