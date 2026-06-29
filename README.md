



# Secure Expense Tracker Engine

A secure FastAPI-based backend engine for maintaining and tracking secure expense transaction logs. Built using Python, **FastAPI**, **SQLModel**, and **PostgreSQL**.

---

## Features

- **Authentication System:** Secure registration and passlib/bcrypt password hashing with JWT token generation.
- **Insecure Direct Object Reference (IDOR) Protection:** Explicit ownership verification checks on profile routes and transaction entries.
- **User Profiles:** Retrieve, update, and delete user profiles (deleting a user cascades to delete all their transaction logs).
- **Transaction Logs:** Complete CRUD operations (create, read, update, delete) for transaction logs linked to authenticated users.
- **Database Integration:** Integrated with PostgreSQL via SQLModel.
- **Testing:** Automated unit testing using Pytest and HTTPX.

---

## Directory Structure

```text
expense_tracker/
├── app/
│   ├── config/
│   │   ├── configEnv.py      # Environment variables configuration
│   │   ├── database.py       # SQLModel database engine and session configuration
│   │   └── __init__.py
│   ├── models/
│   │   ├── schemas.py        # SQLModel table definitions & Pydantic schemas
│   │   └── __init__.py
│   ├── routes/
│   │   ├── auth.py           # Authentication routes (registration, login)
│   │   ├── transactions.py   # Transaction routes (create, list, get, update, delete)
│   │   ├── user.py           # Secure user profile routes (get, update, delete)
│   │   └── __init__.py
│   ├── main.py               # Application startup, CORS configuration, and lifespan handlers
│   └── __init__.py
├── utils/
│   ├── security.py           # Password hashing, JWT creation, and dependency verification
│   └── __init__.py
├── test_main.py              # Pytest backend validation suite using in-memory SQLite
└── .gitignore                # Git ignore file for Python & macOS configurations

```

---

## Setup & Installation

### 1. Prerequisites

* **Python 3.10+**
* **PostgreSQL** running locally

### 2. Clone and Setup Environment

Create a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

```

### 3. Install Dependencies

Install the required packages:

```bash
pip install fastapi uvicorn[standard] sqlmodel pydantic[email] passlib[bcrypt] psycopg2-binary pyjwt httpx pytest

```

### 4. Database Setup

Ensure PostgreSQL is running and a database named `expense_db` exists:

```sql
CREATE DATABASE expense_db;

```

*Note: The database connection URL is configured using environment configuration.*

---

## Running the Application

### Start Development Server

Start the FastAPI application using Uvicorn:

```bash
uvicorn app.main:app --reload

```

### Run Automated Tests

Execute the local test suite using Pytest:

```bash
python -m pytest

```

The engine will automatically create the required database tables on startup. You can access:

* **Interactive Documentation (Swagger UI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Alternative API Docs (ReDoc):** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## API Endpoints

### Core

* `GET /` - Root status check.

### Authentication

* `POST /auth/register` - Register a new user. Securely hashes passwords using bcrypt.
* `POST /auth/login` - Authenticate user credentials and return a secure JWT Access Token.

### Users (Protected by JWT)

* `GET /users/{user_id}` - Get current authorized user profile.
* `PATCH /users/{user_id}` - Update current authorized user profile information.
* `DELETE /users/{user_id}` - Delete current user profile (cascading delete on associated transactions).

### Transactions (Protected by JWT)

* `POST /transactions/` - Create a transaction log (automatically assigned to the token owner).
* `GET /transactions/` - List all transactions for the authenticated user.
* `GET /transactions/{transaction_id}` - Get detailed transaction information by ID.
* `PATCH /transactions/{transaction_id}` - Update fields on a specific transaction entry.
* `DELETE /transactions/{transaction_id}` - Delete a specific transaction log entry.


