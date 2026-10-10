# AI Agentic University

AI Agentic University is a university management system with a role-based web
portal and a REST API. The frontend is a Next.js application; the backend is a
separate Express.js service. The frontend repository expects the backend to be
available at `http://localhost:5000` during local development.

## Contents

- [Features](#features)
- [Technology](#technology)
- [System architecture](#system-architecture)
- [Repository layout](#repository-layout)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Environment configuration](#environment-configuration)
- [User workflows](#user-workflows)
- [Payments](#payments)
- [Scripts and checks](#scripts-and-checks)
- [API reference](#api-reference)
- [Troubleshooting](#troubleshooting)

## Features

### Student portal

- Student dashboard, profile, and current course sections
- Browse available sections and enroll or drop courses
- View grades and notifications
- View invoices and payment history and pay eligible invoices through Stripe

### Faculty portal

- Faculty profile and assigned sections
- View enrolled students
- Record attendance, manage assignments, and grade submissions
- Schedule exams and manage academic results

### Admin portal

- University overview and reports
- Manage students, faculty, departments, programs, courses, semesters, and
  sections
- Manage enrollments and review payment records
- Review student registration requests, assign academic details, and approve
  accounts

### Super-admin portal

- Administrative user and system management, including audit and settings
  features supported by the backend

### Authentication

- Email OTP registration and verification
- Pending student approval before student access is activated
- Login, refreshable cookie-based sessions, logout, and password recovery
- Role-based access for students, faculty, admins, and super admins

## Technology

| Area | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling and UI | Tailwind CSS 4, Base UI, custom UI components |
| Forms and validation | TanStack Form, Zod |
| Data fetching | ofetch, TanStack Query |
| Charts and tables | Recharts, TanStack Table |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Cache | Redis |
| Authentication | JWT, HTTP-only cookies, bcrypt |
| Payments | Stripe Checkout and webhooks |
| Email | Nodemailer and EJS templates |

## System architecture

```text
Browser (Next.js, normally :3000)
    |
    | REST API requests; credentials included
    v
Express API (normally :5000)
    |-- PostgreSQL (university and payment records)
    |-- Redis (registration OTP and session-related data)
    |-- Nodemailer (verification and other emails)
    `-- Stripe (checkout sessions and payment verification)
```

The frontend obtains its API base URL from `NEXT_PUBLIC_API_BASE_URL` (or the
legacy `NEXT_PUBLIC_API_URL`) and defaults to `http://localhost:5000`. The API
client includes cookies and attempts to refresh a session after an eligible
`401` response.

In the browser, API requests are sent through the frontend's same-origin
`/api/backend` route. This lets the frontend own the authentication cookies
even when the backend is on a separate Vercel domain. Configure
`BACKEND_API_URL` on the frontend deployment to point to the backend; the
`NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_API_URL` variables remain supported
as compatibility fallbacks.

The backend is maintained as a separate project. Its README, environment
template, and detailed endpoint reference are in that backend repository.

## Repository layout

```text
ai_agentic_university/
├── public/                     # Static public assets
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login, registration, and OTP pages
│   │   ├── (dashboard)/
│   │   │   ├── admin/          # Admin dashboard and management pages
│   │   │   ├── faculty/        # Faculty dashboard and teaching tools
│   │   │   └── student/        # Student dashboard and self-service pages
│   │   └── api/                # Next.js server routes (for example logout)
│   ├── components/             # Role-specific and shared UI components
│   ├── config/                 # Frontend configuration
│   ├── data/                   # Shared/static UI data
│   ├── hooks/                  # Shared React hooks
│   ├── lib/                    # API client, auth, and utilities
│   ├── provider/               # React Query and app providers
│   ├── services/               # Typed API calls by domain
│   ├── types/                  # Frontend domain and API types
│   └── validation/             # Zod schemas
├── .env.local                  # Local frontend environment (not committed)
├── package.json
└── README.md
```

The corresponding backend project has its own `src/module` areas for
authentication, students, faculty, admin, and super-admin, plus database,
middleware, email templates, and API documentation.

## Requirements

- Node.js compatible with the installed Next.js version (Node.js 20 or later is
  recommended)
- npm
- A running backend API
- For a full backend setup: PostgreSQL 15+, Redis, email SMTP credentials, and
  Stripe test credentials

## Run locally

### 1. Start the backend

Set up and start the separate backend project first. Follow its README to
install dependencies, configure its `.env`, prepare PostgreSQL and Redis, apply
its database migrations, and start the API. The default local API URL is
`http://localhost:5000`.

### 2. Configure the frontend

Create or update `.env.local` in the frontend project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

`NEXT_PUBLIC_API_URL` is also recognized for compatibility. Do not put backend
secrets, database credentials, or Stripe secret keys in a `NEXT_PUBLIC_`
variable; those values are exposed to the browser.

### 3. Install and start the frontend

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Keep the backend running
while using API-backed pages.

### Production build

```powershell
npm run build
npm run start
```

Set `BACKEND_API_URL` to the deployed API URL in the frontend project's Vercel
environment variables. The same-origin proxy makes browser API requests through
the frontend host, so browser CORS access to the backend is not required.

## Environment configuration

### Frontend

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | No | Backend API base URL; defaults to `http://localhost:5000` |
| `NEXT_PUBLIC_API_URL` | No | Legacy alternative to `NEXT_PUBLIC_API_BASE_URL` |
| `BACKEND_API_URL` | Recommended for deployment | Server-side backend URL used by the same-origin API proxy |

Use one API URL variable, preferably `NEXT_PUBLIC_API_BASE_URL`.

### Backend

The backend reads configuration from its own `.env` file. Its values include:

- `PORT`, `APP_URL`, and `FRONTEND_URL`
- `DATABASE_URL`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_USER`, and `REDIS_PASSWORD`
- `EMAIL_SENDER` and `APP_PASSWORD`
- `BCRYPT_SALT_ROUNDS`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
  `JWT_ACCESS_EXPIRES_IN`, and `JWT_REFRESH_EXPIRES_IN`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and
  `STRIPE_SEMESTER_PRICE_ID`

Use the backend's `.env.example` and README as the source of truth for required
values and provider-specific formats. Never commit real credentials.

## User workflows

### Student registration and approval

1. An applicant submits their name, email, password, and optional phone number.
2. The API emails an OTP; the applicant verifies it.
3. The API creates an inactive student-role account without issuing a login
   session.
4. An administrator opens **Admin → Students**, selects the pending request,
   assigns a department and a program from that department, and sets academic
   year/semester details. A student ID can be entered or generated by the API.
5. Approval creates the student profile and activates the account. The student
   can then sign in.

### Course enrollment and invoices

Students enroll in course sections offered by the backend. Enrollment billing
and invoice behavior is managed server-side. Students can see actual invoices
and payment status on **Student → Payments**.

### Payment

1. The student selects an eligible pending invoice.
2. The backend creates a Stripe Checkout session.
3. Stripe returns the student to the application after payment or cancellation.
4. The backend verifies the payment using its Stripe webhook and/or success
   verification handler and updates the invoice/payment records.

Use Stripe test-mode credentials for local development. A payment shown as
successful in the UI is not proof of a real transaction; confirm the invoice
and payment status on the backend.

## Scripts and checks

Run these commands from the frontend project root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Build the production frontend |
| `npm run start` | Serve the production build |
| `npm run lint` | Run Biome checks |
| `npm run format` | Format files with Biome |

The frontend package does not currently define a dedicated test script. Consult
the backend project for its API build and test commands.

## API reference

- The backend API reference (`api_reference.md`) documents authentication,
  student, faculty, admin, and payment endpoints.
- The API base URL defaults to `http://localhost:5000`.
- Protected API calls use the backend's authentication cookies and role-based
  authorization.
- API responses generally use a `success`, `statusCode`, `message`, and `data`
  envelope.

## Troubleshooting

### The browser reports `Failed to fetch` or a connection error

Check that the backend is running at the configured
`NEXT_PUBLIC_API_BASE_URL`, and restart the frontend after changing
`.env.local`.

### The API returns `401`

Sign in again and check that the browser accepts cookies for both local
services. Pending student registrations cannot sign in until approved.

### The API returns `404`

Confirm that the running backend includes the requested route and that the
frontend and backend versions match. A `404` is not resolved by frontend
fallback/demo data.

### The API returns `500`

Check the backend terminal output and server logs for the exception. The browser
trace identifies the failed request but may not include the cause.

### A payment is not reflected

Check the backend Stripe configuration, webhook delivery, and invoice/payment
records. Restart the backend after changing its environment or server code.

## License

No license is specified in this repository. Contact the project maintainers
before redistributing or using it outside the intended project.
