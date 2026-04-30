# Expense Tracker

A modern expense tracking application built with FastAPI, Tailwind CSS, and Vanilla JavaScript SPA (Single Page Application).

## Features

▸ Dashboard - Overview of your spending with this month, week, and today statistics
▸ Expense & Income Management - Add, categorize, and track transactions
▸ Category Management - Create custom categories with custom colors
▸ Charts & Analytics - Visual representation of spending by category using Chart.js
▸ User Authentication - Secure login with JWT tokens
▸ Modern UI - Beautiful dark theme with Tailwind CSS
▸ SPA - Smooth client-side navigation without page reloads

## Tech Stack

### Backend
▸ FastAPI - Modern Python web framework
▸ SQLAlchemy - ORM for database management
▸ SQLite - Lightweight database
▸ JWT - Secure authentication

### Frontend
▸ HTML5 - Semantic markup
▸ Tailwind CSS v4 - Utility-first CSS framework
▸ Vanilla JavaScript - SPA with client-side routing
▸ Chart.js - Beautiful charts and analytics

## Project Structure

```
expense-tracker/
├── app/
│   ├── main.py                   # FastAPI entry point
│   ├── database.py               # Database configuration
│   ├── models.py                 # SQLAlchemy models
│   ├── schema.py                 # Pydantic schemas
│   ├── routes.py                 # API endpoints
│   ├── auth.py                   # Authentication logic
│   ├── tokens.py                 # JWT token management
│   └── __pycache__
│
├── frontend/
│   ├── static/
│   │   ├── app.js                # Main SPA logic
│   │   ├── auth.js               # Auth handling
│   │   └── favicon.svg
│   └── templates/
│       ├── index.html
│       ├── login_page.html
│       └── dashboard.html
│
├── .env
├── .gitignore
├── pyproject.toml
├── uv.lock
├── database.db
└── README.md
```

## Getting Started

### Prerequisites
▸ Python 3.9+
▸ uv package manager (or pip)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd expense-tracker
```

2. Create .env file
```bash
touch .env
```

3. Generate SECRET_KEY
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Add to .env:
```env
DATABASE_URL=sqlite:///./database.db
SECRET_KEY=your-generated-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. Install dependencies
```bash
uv sync
```

5. Run the server
```bash
uv run uvicorn app.main:app --reload
```

6. Open in browser
```
http://localhost:8000
```

## API Endpoints

### Authentication
▸ POST /api/register - Create new account
▸ POST /api/login - Login & get JWT token
▸ GET /api/logout - Logout (clear cookie)

### Dashboard
▸ GET /api/data - Get all transactions, categories, and user info
▸ GET /api/month_transactions - Get this month's stats
▸ GET /api/week_transactions - Get this week's stats
▸ GET /api/today_transactions - Get today's stats

### Transactions
▸ POST /api/add_transaction - Add new transaction
▸ DELETE /api/del_transaction/{id} - Delete transaction

### Categories
▸ POST /api/add_categories - Create new category
▸ DELETE /api/del_category/{id} - Delete category

## Key Features

### Single Page Application (SPA)
▸ Client-side routing between Dashboard, Transactions, Categories, Charts
▸ No page reloads - smooth navigation
▸ All state managed in JavaScript
▸ Fast and responsive user experience

### Real-time Updates
▸ Charts update automatically when you add transactions
▸ Statistics refresh instantly
▸ Category list updates without delay

### Dark Theme
Beautiful dark interface with Zinc color palette using Tailwind CSS.

## Security

▸ Passwords hashed with bcrypt
▸ JWT tokens for authentication
▸ HTTP-only cookies (secure)
▸ SQL injection protection via SQLAlchemy ORM

## Database Models

### User
▸ id (Integer, PK)
▸ username (String, unique)
▸ email (String, unique)
▸ hashed_password (String)
▸ created_at (DateTime)

### Transaction
▸ id (Integer, PK)
▸ user_id (Integer, FK)
▸ category_id (Integer, FK)
▸ name (String)
▸ amount (Float)
▸ type (String: 'expense' or 'income')
▸ created_at (DateTime)
▸ date (Date)

### Category
▸ id (Integer, PK)
▸ user_id (Integer, FK)
▸ name (String)
▸ color (String: hex color)
▸ created_at (DateTime)

## Usage

### Add Transaction
1. Go to Transactions section
2. Fill in Name, Amount, Type, Category, Date
3. Click "Add Transaction"
4. Dashboard updates automatically

### Create Category
1. Go to Categories section
2. Enter category name
3. Pick a color
4. Click "Add"
5. Category appears in transaction form

### View Analytics
1. Go to Charts section
2. See spending breakdown by category
3. Bar chart updates with latest transactions

## Configuration

Edit .env to customize:

```env
DATABASE_URL=sqlite:///./database.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Future Enhancements

▸ Budget limits & alerts
▸ Monthly reports & exports
▸ Recurring transactions
▸ Multi-user support improvements
▸ Mobile app (React Native)
▸ Cloud sync
▸ Advanced filtering & search

## License

MIT License

## Author

Mieszek - https://mieszek.dev