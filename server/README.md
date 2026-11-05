# AlgoFlow API and database

The backend runs independently from the Vite frontend. Use Python 3.11 or newer.

## Setup (PowerShell)

```powershell
cd server
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Set `DATABASE_URL` in `.env` to a PostgreSQL URL for the existing `algoflow`
database and set `JWT_SECRET_KEY` to a randomly generated secret of at least
32 characters. Do not overwrite or commit an existing `.env`. No database or
application records are seeded.

Generate a signing secret without printing it to the terminal:

```powershell
.\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(48))"
```

Store the generated value in the ignored `.env` file or inject it through the
process environment. Never commit or log it.

## Migrations

Review the generated SQL without connecting to PostgreSQL:

```powershell
.\.venv\Scripts\python.exe -m alembic -c alembic.ini upgrade head --sql
```

Apply migrations only after configuring and verifying the intended database:

```powershell
.\.venv\Scripts\python.exe -m alembic -c alembic.ini upgrade head
```

The initial migration creates users, profiles, learning progress, problems,
submissions, bookmarks, and achievements. Topics are represented by stable
content keys in learning progress; a dynamic topics table is not included.

## Run and test

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
.\.venv\Scripts\python.exe -m pytest -q tests
```

The API documentation is available at `http://localhost:8000/docs`.
