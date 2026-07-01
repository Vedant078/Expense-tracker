


---


# Secure Expense Tracker Engine

A secure, cloud-deployed FastAPI-based backend engine for maintaining and tracking encrypted expense transaction logs. Built using Python, **FastAPI**, **SQLModel**, and **PostgreSQL**.

---

## Features

- **Authentication System:** Secure registration and native cryptographic **bcrypt** password hashing with stateless JWT access token generation.
- **Insecure Direct Object Reference (IDOR) Protection:** Explicit ownership verification checks on profile routes and transaction entries to prevent unauthorized cross-user data access.
- **User Profiles:** Retrieve, update, and delete user profiles (deleting a user triggers a cascading database delete on all associated transaction logs).
- **Transaction Logs:** Complete CRUD operations (create, read, update, delete) for individual transaction logs linked to authenticated users.
- **Database Integration:** Fluid object-relational mapping with PostgreSQL via SQLModel.
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
│   ├── utils/
│   │   ├── security.py       # Native bcrypt hashing, JWT creation, and dependency verification
│   │   └── __init__.py
│   ├── main.py               # Application startup, CORS configuration, and lifespan handlers
│   └── __init__.py
├── test_main.py              # Pytest backend validation suite using in-memory SQLite
└── .gitignore                # Git ignore file for Python & macOS configurations

```

---

## Setup & Installation

### 1. Prerequisites

* **Python 3.10+**
* **PostgreSQL** running locally or a hosted cloud instance

### 2. Clone and Setup Environment

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

```

### 3. Install Dependencies

Install the clean, required production packages (fully decoupled from legacy passlib wrappers):

```bash
pip install fastapi uvicorn[standard] sqlmodel pydantic[email] bcrypt psycopg2-binary pyjwt httpx pytest

```

### 4. Database Setup

Ensure PostgreSQL is running and a target database named `expense_db` exists:

```sql
CREATE DATABASE expense_db;

```

*Note: Database connection credentials are dynamic and managed cleanly via environment configurations.*

---

## Running the Application

### Start Development Server

Launch the local FastAPI application using Uvicorn:

```bash
uvicorn app.main:app --reload

```

### Run Automated Tests

Execute the backend validation test suite via Pytest:

```bash
python -m pytest

```

The system automatically maps and initializes the required database table schemas on startup. Once running, you can interact with the system via:

* **Interactive Documentation (Swagger UI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Alternative API Docs (ReDoc):** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## API Endpoints

### Core

* `GET /` - Root API operational status check.

### Authentication

* `POST /auth/register` - Register a new user. Passwords are securely encoded to UTF-8 bytes and hashed natively via bcrypt before database storage.
* `POST /auth/login` - Authenticate user credentials and issue a secure, time-sensitive JWT Access Token.

### Users (Protected by JWT)

* `GET /users/{user_id}` - Fetch current authorized user profile data.
* `PATCH /users/{user_id}` - Update profile parameters for the authorized user.
* `DELETE /users/{user_id}` - Purge current user account with cascading destruction of nested user data.

### Transactions (Protected by JWT)

* `POST /transactions/` - Append an expense entry (automatically bounded to the token owner).
* `GET /transactions/` - Extract a complete listing of transaction history for the authenticated client.
* `GET /transactions/{transaction_id}` - Isolate detailed ledger statistics for an explicit log entry ID.
* `PATCH /transactions/{transaction_id}` - Selectively mutate fields inside a specified transaction row.
* `DELETE /transactions/{transaction_id}` - Securely erase an isolated transaction record.

---

## Frontend Client Integration

The backend engine connects to a decoupled, responsive client application scaffolded and bundled using **Vite**, deployed live on **Vercel**.

### Architecture Specifications
* **Build Tooling & Bundler:** Vite (delivering fast Hot Module Replacement and highly optimized production assets).
* **Framework Stack:** HTML5, Tailwind CSS / Vanilla CSS, Modern Asynchronous JavaScript (ES6+).
* **State Management:** Browser `LocalStorage` mechanisms for client-side JWT access token persistence and session security.
* **Network Communication:** Native `Fetch API` wrapping asynchronous runtime operations (`async/await`) to seamlessly ingest cloud API data.

### Deployment Link
* **Live Production Client:** [https://expense-tracker-mu-two-38.vercel.app/](https://expense-tracker-mu-two-38.vercel.app/)