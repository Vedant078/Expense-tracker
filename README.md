# Secure Expense Tracker Engine

A secure FastAPI-based backend engine for maintaining and tracking secure expense transaction logs. Built using Python, **FastAPI**, **SQLModel**, and **PostgreSQL**.

---

## Features

- **Authentication System:** Secure registration and passlib/bcrypt password hashing.
- **User Profiles:** Retrieve, update, and delete user profiles (deleting a user cascades to delete all their transaction logs).
- **Transaction Logs:** Complete CRUD operations (create, read, update, delete) for transaction logs linked to users with cascading deletes.
- **Database Integration:** Integrated with PostgreSQL via SQLModel.

---

## Directory Structure

```text
expense_tracker/
├── app/
│   ├── config/
│   │   ├── database.py       # SQLModel database engine and session configuration
│   │   └── __init__.py
│   ├── models/
│   │   ├── schemas.py        # SQLModel table definitions & Pydantic schemas
│   │   └── __init__.py
│   ├── routes/
│   │   ├── auth.py           # Authentication routes (e.g., registration)
│   │   ├── transactions.py   # Transaction routes (create, list, get, update, delete)
│   │   ├── user.py           # User profile routes (get, update, delete)
│   │   └── __init__.py
│   ├── main.py               # Application startup and lifespan event handlers
│   └── __init__.py
└── .gitignore                # Git ignore file for Python & macOS configurations
```

---

## Setup & Installation

### 1. Prerequisites
- **Python 3.10+**
- **PostgreSQL** running locally

### 2. Clone and Setup Environment

Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### 3. Install Dependencies
Install the required packages:
```bash
pip install fastapi uvicorn[standard] sqlmodel pydantic[email] passlib[bcrypt] psycopg2-binary
```

### 4. Database Setup
Ensure PostgreSQL is running and a database named `expense_db` exists:
```sql
CREATE DATABASE expense_db;
```
*Note: The database connection URL is configured in `app/config/database.py`.*

---

## Running the Application

Start the FastAPI application using Uvicorn:
```bash
uvicorn app.main:app --reload
```

The engine will automatically create the required database tables on startup. You can access:
- **Interactive Documentation (Swagger UI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative API Docs (ReDoc):** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## API Endpoints

### Core
- `GET /` - Root status check.

### Authentication
- `POST /auth/register` - Register a new user. Securely hashes passwords using bcrypt.

### Users
- `GET /users/{user_id}` - Get a user profile by ID.
- `PATCH /users/{user_id}` - Update user profile information.
- `DELETE /users/{user_id}` - Delete user profile (cascading delete on associated transactions).

### Transactions
- `POST /transactions/` - Create a transaction log (requires user validation).
- `GET /transactions/` - List all transactions for a user (`?user_id=1`).
- `GET /transactions/{transaction_id}` - Get detailed transaction information by ID.
- `PATCH /transactions/{transaction_id}` - Update one or more transaction fields.
- `DELETE /transactions/{transaction_id}` - Delete a specific transaction log entry.
