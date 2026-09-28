# Job Application Tracker

A web app to track job applications from apply to offer. Built with **React (Vite)**, **FastAPI** and **MySQL**.



## Features

- Sign up and log in (JWT + bcrypt). Users only see their own data
- Add, edit and delete applications with a status: Applied, OA, Interview, Offer, Rejected
- Table view with search and filter, plus a drag-and-drop Kanban board
- Track interview rounds for each application
- Upload the resume you sent (PDF/DOC/DOCX, max 5 MB)
- Today panel: overdue next steps, steps due in 3 days, applications with no update for 7+ days, interview and offer rates
- Optional AI auto-fill: paste a job description and it fills company, role and skills for you to review

## Tech stack

| Part | Tools |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | MySQL (SQLite works for local use) |
| Auth | JWT, bcrypt |
| Tests | Pytest (11 tests) |

## Run it locally

You need Python 3.10+ and Node.js 18+.

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac / Linux
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill it in:

```bash
copy .env.example .env         # Windows
cp .env.example .env           # Mac / Linux
```

Then start the server:

```bash
uvicorn app.main:app --reload
```

The API runs at http://localhost:8000 (docs at `/docs`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## Environment variables (`backend/.env`)

| Variable | What it is |
|---|---|
| `DATABASE_URL` | `sqlite:///./dev.db` for quick start, or `mysql+pymysql://user:password@localhost:3306/job_tracker` |
| `SECRET_KEY` | Any long random string (generate: `python -c "import secrets; print(secrets.token_hex(32))"`) |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | For example `60` |
| `FRONTEND_ORIGIN` | `http://localhost:5173` |
| `OPENAI_API_KEY` | Optional. Enables AI auto-fill |
| `LLM_BASE_URL` | Optional. Use another OpenAI-compatible provider, such as Gemini |
| `LLM_MODEL` | Optional. Model name (default `gpt-4o-mini`) |

Restart the backend after changing `.env`.

## Run the tests

```bash
cd backend
pytest -v
```

