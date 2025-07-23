import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useTransactions } from '../contexts/TransactionContext';
import { ArrowLeft } from 'lucide-react';

Chart.register(...registerables);

export default function VisualizationPage() {
  const doughnutRef = useRef(null);
  const barRef = useRef(null);
  const lineRef = useRef(null);
  const doughnutChart = useRef(null);
  const barChart = useRef(null);
  const lineChart = useRef(null);
  const { transactions } = useTransactions();

  useEffect(() => {
    // Doughnut Chart: Income vs Expense
    if (doughnutRef.current) {
      const ctx = doughnutRef.current.getContext('2d');
      const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
      const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
      if (doughnutChart.current) doughnutChart.current.destroy();
      doughnutChart.current = new Chart(ctx, {
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
            legend: { position: 'top' },
            title: { display: true, text: 'Income vs Expense' },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `₹${context.raw.toFixed(2)}`;
                }
              }
            }
          },
          animation: { animateScale: true, animateRotate: true }
        }
      });
    }
    // Bar Chart: Category Breakdown (only expenses)
    if (barRef.current) {
      const ctx = barRef.current.getContext('2d');
      const categories = transactions.reduce((acc, t) => {
        if (t.amount < 0) {
          acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        }
        return acc;
      }, {});
      if (barChart.current) barChart.current.destroy();
      const colorPalette = [
        '#453596', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6',
        '#3498db', '#e67e22', '#1abc9c', '#34495e', '#7f8c8d'
      ];
      barChart.current = new Chart(ctx, {
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
            legend: { display: false },
            title: { display: true, text: 'Expenditure by Category' },
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
          animation: { duration: 1500, easing: 'easeInOutQuart' },
          hover: { mode: 'nearest', intersect: false, animationDuration: 200 }
        }
      });
    }
    // Line Chart: Expenditure Trend Over Time (only expenses)
    if (lineRef.current) {
      const ctx = lineRef.current.getContext('2d');
      // Group by date (YYYY-MM-DD)
      const dateMap = {};
      transactions.forEach(t => {
        if (t.amount < 0) {
          const date = new Date(t.date).toISOString().slice(0, 10);
          dateMap[date] = (dateMap[date] || 0) + Math.abs(t.amount);
        }
      });
      const sortedDates = Object.keys(dateMap).sort();
      const data = sortedDates.map(date => dateMap[date]);
      if (lineChart.current) lineChart.current.destroy();
      lineChart.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sortedDates,
          datasets: [{
            label: 'Daily Expenditure',
            data,
            fill: false,
            borderColor: '#453596',
            backgroundColor: '#453596',
            tension: 0.2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            title: { display: true, text: 'Expenditure Trend Over Time' },
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
          }
        }
      });
    }
    // Cleanup
    return () => {
      if (doughnutChart.current) doughnutChart.current.destroy();
      if (barChart.current) barChart.current.destroy();
      if (lineChart.current) lineChart.current.destroy();
    };
  }, [transactions]);

  return (
    <div className="visualization-container">
      <h2>Transaction Visualization</h2>
      <div>
        <h3>Income vs Expense</h3>
        <canvas ref={doughnutRef} id="expenditureChart"></canvas>
      </div>
      <div>
        <h3>Breakdown by Categories</h3>
        <canvas ref={barRef} id="categoryChart"></canvas>
      </div>
      <div>
        <h3>Expenditure Trend Over Time</h3>
        <canvas ref={lineRef} id="trendChart"></canvas>
      </div>
      <button
        className="btn"
        style={{ background: '#453596', color: '#fff', fontWeight: 700, fontSize: '1.1em', borderRadius: 10, padding: '0.9em 1.5em', marginTop: 24, width: '100%' }}
        onClick={() => window.location.href = '/'}
      >
        <ArrowLeft size={20} style={{marginRight: 8}} /> Return to Dashboard
      </button>
    </div>
  );
}
