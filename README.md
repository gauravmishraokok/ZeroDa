
# Zero Da

> Because Balance Shouldn’t Be Zero, Da!

---

## Visual Feature Flow

```mermaid
flowchart TD
    %% Root node
    ZD[Zero Da<br>Feature Overview]

    %% Connect root to feature groups
    ZD --> DBGroup
    ZD --> ANGroup
    ZD --> AIGroup

    %% Dashboard Subgraph
    subgraph DBGroup [ ]
        direction TB
        DB[Dashboard<br>Balance / Txn / History]
        DB --> BAL[Balance<br>Live View]
        DB --> TXN[Transactions<br>Auto Categorized]
        DB --> HIST[History<br>Date Filter]
    end

    %% Analytics Subgraph
    subgraph ANGroup [ ]
        direction TB
        AN[Analytics<br>Trends / Categories]
        AN --> TRENDS[Trends<br>Spending Over Time]
        AN --> CATS[Categories<br>Spending Areas]
        AN --> GRAPHS[Graphs<br>Visual Insights]
    end

    %% AI Assistant Subgraph
    subgraph AIGroup [ ]
        direction TB
        AI[AI Assistant<br>SMS / Forecast / Insights]
        AI --> SMS[SMS Sync<br>Auto Entry]
        AI --> FC[Forecast<br>Budget Alerts]
        AI --> INS[Insights<br>Spending Habits]
    end

    %% Styling - NO comma-separated styles to avoid ghost nodes
    style ZD fill:#453596,stroke:#222,stroke-width:2px,color:#fff

    style DB fill:#f3f0fa,stroke:#453596,stroke-width:1.5px
    style BAL fill:#f8f9fa,stroke:#bbb
    style TXN fill:#f8f9fa,stroke:#bbb
    style HIST fill:#f8f9fa,stroke:#bbb

    style AN fill:#f3f0fa,stroke:#453596,stroke-width:1.5px
    style TRENDS fill:#f8f9fa,stroke:#bbb
    style CATS fill:#f8f9fa,stroke:#bbb
    style GRAPHS fill:#f8f9fa,stroke:#bbb

    style AI fill:#f3f0fa,stroke:#453596,stroke-width:1.5px
    style SMS fill:#f8f9fa,stroke:#bbb
    style FC fill:#f8f9fa,stroke:#bbb
    style INS fill:#f8f9fa,stroke:#bbb

    style DBGroup fill:transparent,stroke:transparent
    style ANGroup fill:transparent,stroke:transparent
    style AIGroup fill:transparent,stroke:transparent


```

---

## Overview
Zero Da is a modern, AI-powered expense tracker and analytics platform. Track your income and expenses, visualize your spending, and get actionable AI insights—all in a beautiful, secure, and easy-to-use web app.

---

## Features
- Transaction Management: Add, view, and delete transactions with ease.
- Category Breakdown: Categorize transactions (Income, Groceries, Utilities, etc.).
- Visual Analytics: Interactive charts for trends and category breakdowns.
- AI Automation: Sync and process SMS messages to auto-create transactions.
- Spending Forecast: Predict your monthly spend and get budget warnings.
- AI Insights: Get smart, actionable insights on your spending habits.
- Modern UI: Responsive, clean, and consistent design across all pages.

---

## Tech Stack
| Component        | Technology                |
|------------------|---------------------------|
| Backend          | Node.js, Express, MongoDB |
| Frontend         | React, Vite, CSS          |
| AI Integration   | Google Gemini API         |

---

## Project Structure
```
ZeroDa/
  ├── backend/      # Express + MongoDB API + Node
  ├── frontend/     # React + Vite client
  └── README.md     
```

---

## Setup Guide

1. **Clone the Repository**
   ```bash
   git clone <repo-url>
   cd ZeroDa
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Add your .env file (see below)
   node server.js
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```


---

## Sample .env Format (Backend)
Create a `.env` file in the `backend/` directory with the following format:

```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

- `backend/.env` is required for backend server to connect to MongoDB and Gemini AI.

---

## Security & Data Privacy
As this app involves sharing financial data with AI services, data security is a top priority. Always use secure API keys and never expose sensitive information in public repos.

![security image](https://i.imgur.com/BsnzKFX_d.webp?maxwidth=1520&fidelity=grand)

- All sensitive keys should be stored in environment variables (`.env` files).
- Use HTTPS in production.
- Never share your database URI or API keys publicly.

---

**Made by Gaurav Mishra**
