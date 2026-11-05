# AlgoFlow — DSA Learning & Algorithm Visualization Platform

**Learn Data Structures. Visualize Algorithms. Master Problem Solving.**

AlgoFlow is a full-stack Data Structures and Algorithms (DSA) learning platform designed to help developers understand complex computer science concepts through interactive visualizations, structured learning modules, and hands-on practice.

The platform combines algorithm visualization with a scalable backend architecture to create an interactive learning experience for students and developers preparing for technical interviews and software engineering opportunities.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Current Development Status](#current-development-status)
- [Upcoming Features](#upcoming-features)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Understanding Data Structures and Algorithms requires more than memorizing code. AlgoFlow focuses on making algorithmic concepts easier to understand through step-by-step visual execution.

Users can explore graph algorithms, understand how they work, and follow their execution visually.

### Project Goals

- Make DSA concepts easier to understand.
- Provide interactive algorithm visualizations.
- Organize learning into structured modules.
- Build a foundation for personalized learning progress.
- Support problem-solving and technical interview preparation.
- Provide a scalable full-stack architecture.

---

## Key Features

### 1. Interactive Algorithm Visualizations

Explore algorithms through interactive visual representations.

**Graph Algorithms:**

- Graph Fundamentals
- Breadth-First Search (BFS)
- Depth-First Search (DFS)
- Cycle Detection
- Topological Sorting
- Shortest Path Algorithms
  - Dijkstra's Algorithm
  - Bellman-Ford Algorithm
  - Floyd-Warshall Algorithm
- Minimum Spanning Tree
  - Prim's Algorithm
  - Kruskal's Algorithm
- Disjoint Set Union (DSU)
- Strongly Connected Components
  - Kosaraju's Algorithm
  - Tarjan's Algorithm
- Bridges and Articulation Points

### 2. Backend Authentication

Authentication APIs built using FastAPI.

- User registration
- User login
- Password hashing using Argon2
- JWT-based authentication
- Authenticated user profile endpoint
- Duplicate email and username validation
- Protected API access

### 3. Database Management

PostgreSQL database with SQLAlchemy ORM and Alembic migrations.

Database entities include:

- Users
- User Profiles
- Learning Progress
- Problems
- Submissions
- Bookmarks
- Achievements

### 4. Responsive User Interface

- React-based frontend
- Interactive visualization components
- Responsive layouts
- Clean and minimal interface
- Reusable UI components

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, JavaScript |
| Build Tool | Vite |
| Styling | CSS |
| Icons | Lucide React |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.x |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Authentication | JWT, PyJWT |
| Password Security | Argon2 |
| Testing | Vitest, Pytest |
| API Server | Uvicorn |
| Version Control | Git, GitHub |

---

## Project Architecture

AlgoFlow follows a layered full-stack architecture.

```text
                 ALGOfLOW PLATFORM
                        |
          +-------------+-------------+
          |                           |
     FRONTEND                     BACKEND
          |                           |
     React + Vite                 FastAPI
          |                           |
     UI Components              API Routes
          |                           |
     Visualizations              Services
          |                           |
     API Integration          SQLAlchemy ORM
          |                           |
          +-------------+-------------+
                        |
                    PostgreSQL
                        |
             Persistent Application Data
```

### Architecture Layers

**1. Presentation Layer**

React components, pages, navigation, and algorithm visualizations.

**2. Application Layer**

FastAPI endpoints, authentication, business logic, and validation.

**3. Data Layer**

PostgreSQL database, SQLAlchemy models, and Alembic migrations.

**4. Security Layer**

JWT authentication and Argon2 password hashing.

---

## Project Structure

```text
DSA/
│
├── src/
│   ├── components/
│   │   └── visualizers/
│   │       └── TreeVisualizer.jsx
│   ├── ...
│   ├── App.jsx
│   └── main.jsx
│
├── server/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py
│   │   │   │   └── health.py
│   │   │   └── dependencies.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   │
│   │   ├── database/
│   │   │   └── connection.py
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── tests/
│   ├── .env.example
│   ├── alembic.ini
│   └── requirements.txt
│
├── public/
├── tests/
├── .gitignore
├── package.json
└── README.md
```

*Note: This is a high-level structure. Some files and directories are omitted for readability.*

---

## Getting Started

### Prerequisites

Install the following tools before running AlgoFlow:

- Node.js and npm
- Python 3.11+
- PostgreSQL
- Git

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/AlgoFlow.git
```

Navigate to the project:

```bash
cd AlgoFlow
```

---

## Frontend Setup

Navigate to the project root.

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will typically be available at:

```text
http://localhost:5173
```

---

## Backend Setup

Navigate to the backend directory:

```bash
cd server
```

### 1. Create a Virtual Environment

```powershell
python -m venv .venv
```

### 2. Activate the Virtual Environment

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server/` directory.

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/algoflow

FRONTEND_ORIGIN=http://127.0.0.1:5173

JWT_SECRET_KEY=YOUR_GENERATED_SECRET
JWT_ALGORITHM=HS256
```

Replace the database credentials with your local PostgreSQL configuration.

Generate a strong JWT secret locally. Never commit `.env` or expose its contents.

### 5. Start the Backend

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend API:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

OpenAPI specification:

```text
http://127.0.0.1:8000/openapi.json
```

---

## Database Setup

### 1. Create PostgreSQL Database

Open PostgreSQL or pgAdmin and execute:

```sql
CREATE DATABASE algoflow;
```

### 2. Apply Database Migrations

From the `server/` directory:

```powershell
python -m alembic upgrade head
```

### 3. Verify Migration Status

```powershell
python -m alembic current
```

### Database Tables

| Table | Purpose |
|---|---|
| users | Stores user account information |
| user_profiles | Stores user profile information |
| learning_progress | Stores learning progress |
| problems | Stores coding problems |
| submissions | Stores problem submissions |
| bookmarks | Stores bookmarked problems |
| achievements | Stores user achievements |
| alembic_version | Tracks database migrations |

---

## API Endpoints

Base URL:

```text
http://127.0.0.1:8000/api/v1
```

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Checks backend and database status |

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Authenticate a user |
| GET | `/auth/me` | Retrieve authenticated user details |

### Authentication Flow

```text
        User Registration
                |
                v
        Validate User Data
                |
                v
       Hash Password (Argon2)
                |
                v
       Save User in PostgreSQL
                |
                v
          User Login
                |
                v
       Verify User Credentials
                |
                v
          Generate JWT
                |
                v
       Access Protected APIs
```

For protected endpoints, include the JWT in the request:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Testing

### Frontend Tests

Run:

```bash
npm test
```

### Frontend Linting

```bash
npm run lint
```

### Frontend Production Build

```bash
npm run build
```

### Backend Tests

From the `server/` directory:

```powershell
python -m pytest
```

### Backend Compilation Check

```powershell
python -m compileall app
```

---

## Current Development Status

| Module | Description | Status |
|---|---|---|
| Phase 1–4 | Existing DSA platform foundation | Implemented |
| Phase 5 | Graph Algorithms & Visualizations | Completed |
| Phase 6 – Module 1 | Backend Foundation | Completed |
| Phase 6 – Module 2 | Database Models & Migrations | Completed |
| Phase 6 – Module 3 | Authentication APIs | Completed |
| Phase 6 – Module 4 | Landing Page & Frontend Authentication | Planned |

**Current validation results:**

- 194 frontend tests passed.
- 27 backend tests passed.
- Frontend lint passed.
- Frontend production build passed.
- PostgreSQL connection verified.
- Database migrations applied successfully.
- Authentication API endpoints verified.

---

## Upcoming Features

The following features are planned for future development:

- Landing page and user onboarding
- Registration and sign-in UI integration
- Protected dashboard
- User profile management
- Learning progress tracking
- DSA problem practice
- Coding submissions
- Bookmark management
- Achievement tracking
- Leaderboards
- Learning analytics
- Additional DSA learning modules

---

## Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Run the relevant tests.
5. Commit your changes.
6. Submit a Pull Request.

Example:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add: your feature"
git push origin feature/your-feature
```

---

## License

This project is currently under development. A license has not yet been specified.

---

## Author

**AlgoFlow — DSA Learning & Algorithm Visualization Platform**

Built with a focus on making Data Structures and Algorithms easier to learn, visualize, and master.

**GitHub:** https://github.com/YOUR_USERNAME/AlgoFlow

---

*Learn. Visualize. Practice. Master DSA.*
