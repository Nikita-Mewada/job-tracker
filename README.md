# Job Application Tracker

A full-stack job/internship application tracker. Users sign up, log applications,
track status through a pipeline (Applied → OA → Interview → Offer/Rejected),
see stats on a dashboard, get follow-up nudges for stale applications, and can
paste a job description to auto-fill the form using an LLM (with mandatory
human review before saving).

## Stack
- Frontend: React (Vite) + Recharts + React Router
- Backend: FastAPI + SQLAlchemy + Pydantic
- Database: MySQL
- Auth: JWT (python-jose) + bcrypt password hashing
- AI: OpenAI API (swappable for Claude API) for JD parsing
- Deployment target: AWS (RDS for MySQL, EC2/Elastic Beanstalk for backend, S3+CloudFront or Vercel for frontend)

## Project structure
```
job-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py            FastAPI app entrypoint, CORS, router registration
│   │   ├── database.py        SQLAlchemy engine/session setup
│   │   ├── models.py          User, Application, Reminder ORM models
│   │   ├── schemas.py         Pydantic request/response schemas
│   │   ├── auth_utils.py      Password hashing, JWT creation/validation
│   │   └── routers/
│   │       ├── auth.py         /auth/signup, /auth/login, /auth/me
│   │       ├── applications.py /applications CRUD (owner-scoped)
│   │       ├── stats.py        /stats/summary for dashboard chart
│   │       ├── ai.py           /ai/parse-jd — LLM-based JD parser
│   │       └── reminders.py    /reminders/needs-followup
│   ├── tests/
│   │   ├── conftest.py         pytest fixtures (test DB, auth headers)
│   │   ├── test_auth.py
│   │   └── test_applications.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx              Routing + auth guard
    │   ├── index.css
    │   ├── api/axios.js         Axios instance with JWT interceptor
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ApplicationCard.jsx
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Signup.jsx
    │       ├── Dashboard.jsx           Stats chart + filterable table
    │       └── AddEditApplication.jsx  Form + AI auto-fill
    ├── package.json
    ├── vite.config.js
    └── index.html
```

## Setup — Backend

1. Install MySQL locally (or use Docker: `docker run --name mysql-jobtracker -e MYSQL_ROOT_PASSWORD=yourpassword -p 3306:3306 -d mysql:8`)
2. Create the database:
   ```sql
   CREATE DATABASE job_tracker;
   ```
3. Set up Python environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate   # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
6. Visit `http://localhost:8000/docs` for interactive Swagger UI — test every endpoint here before touching the frontend.

## Setup — Frontend

```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173`.

## Running tests

```bash
cd backend
pytest -v
```
Tests use an isolated SQLite file (`test.db`), so they never touch your real MySQL data.

## Environment variables (.env)

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `SECRET_KEY` | JWT signing secret — generate with `openssl rand -hex 32` |
| `ALGORITHM` | JWT algorithm (HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiry |
| `OPENAI_API_KEY` | For the AI JD-parser stretch feature |
| `FRONTEND_ORIGIN` | For CORS — your frontend's URL |

## Deployment (AWS free tier)

1. **Database**: Create a MySQL instance on RDS (free tier: db.t3.micro)
2. **Backend**: Push to an EC2 instance, or use Elastic Beanstalk for easier deploys. Set env vars in the instance/EB console instead of a committed `.env`.
3. **Frontend**: Build with `npm run build`, deploy the `dist/` folder to S3 + CloudFront, or just use Vercel/Netlify — much less setup than doing it on AWS.
4. Update `FRONTEND_ORIGIN` in the backend env and `VITE_API_URL` in the frontend env to point to your deployed URLs.

## What to highlight on your resume from this project

- Full-stack app: React frontend, FastAPI backend, REST APIs, MySQL, deployed on AWS
- JWT-based authentication with bcrypt password hashing
- Pydantic schema validation for all API request/response contracts
- Owner-scoped authorization (users can only access their own applications — see `test_cannot_access_other_users_application`)
- AI-assisted feature (LLM-based JD parsing) with a human-in-the-loop review step before data is saved — mirrors "AI-native engineering" practice of validating AI outputs before production use
- Automated testing with pytest covering auth and CRUD flows
- CI/CD-ready structure (add a GitHub Actions workflow running `pytest` on push for an easy additional resume line)
