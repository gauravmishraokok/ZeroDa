
# Zero Da

## Overview

The **Zero Da** is a robust tool designed to help users manage their finances efficiently. It allows users to track income and expenses, categorize transactions, and gain insights into spending habits.

## Features

- **Transaction Management**: Add, view, and delete transactions with ease.
- **Category Breakdown**: Categorize transactions into predefined categories such as Income, Groceries, Utilities, etc.
- **Visual Analytics**: View expenditure trends and category breakdowns through interactive charts.
- **AI Automation**: Utilize AI to process messages and automatically update transactions.
- **Spending Insights**: Generate AI-driven insights and forecasts on spending patterns.

## Tech Stack

| Component        | Technology        |
|------------------|-------------------|
| Backend          | Node.js, Express  |
| Database         | MongoDB           |
| Frontend         | HTML, CSS, JavaScript |
| AI Integration   | Google Cloud Platform (GCP) APIs |

## Application Structure

```
├── Dashboard 
│   ├── Balance Overview
│   ├── Transaction Form
│   └── Transaction History
│
├── Analytics 
│   ├── Expenditure Trends
│   ├── Category Breakdown
│   └── Line Graph for Visualisation
│
└── AI Interface 
    ├── SMS Syncing for Automated Transactions
    ├── Spending Forecast 
    └── Valuable AI Insights 
```

## Logic and Functionality

### Transaction Management

- **Add Transaction**: Users can add transactions by entering a description, amount, category, and date. The transaction is then stored in the MongoDB database.
- **Delete Transaction**: Users can remove transactions, which updates the database and UI in real-time.

### Visual Analytics

- **Income vs. Expense Chart**: Displays a doughnut chart comparing total income and expenses.
- **Category Breakdown**: Shows a bar chart of expenditures by category, helping users identify spending patterns.
- **Line Graph**: Displays a line graph visually comparing gravity of expenditures.

### AI-Driven Insights

- **Message Processing**: The application fetches messages and uses AI to analyze and convert them into transactions and then stores them into the database. This performs ***all accounting with a single click***, saving time and effort.
- **Spending Forecast**: Predicts monthly spending based on past transactions and provides feedback on financial health.
- **AI Insights**: Generates valuable AI insights and analytics while highlighting the positive and negative spending habits, trend analysis, and forecasting.

## Because Balance Shouldn’t Be Zero, Da :)
