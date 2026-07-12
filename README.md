# finSIEM

finSIEM is a role-based financial operations and liquidity monitoring system for mobile financial service workflows. It helps operators, management users, agents, and field officers monitor provider balances, physical cash, transactions, alerts, and operational cases from one dashboard.

The project is split into:

- `backend/` - Express, Prisma, PostgreSQL, JWT authentication, role-based APIs
- `frontend/` - React, Vite, React Router, Axios, role-based UI

## Core Functionality

### Authentication and Roles

finSIEM uses JWT authentication and role-based authorization. The implemented roles are:

- `Management`
- `Operator`
- `Agent`
- `Field Officer`

Each role receives a different sidebar/menu and different API visibility.

### Dashboard

The dashboard shows role-specific operational summaries:

- Physical cash and provider balance summaries
- Recent transactions
- Recent alerts
- Open or assigned cases
- AI-style operational recommendation cards where available

Dashboard data is cached briefly on the backend and invalidated when transactions change liquidity state.

### Transactions

The transaction module supports:

- `CASH_IN`
- `CASH_OUT`
- Bangladeshi transaction phone number validation
- Provider balance updates
- Agent physical cash updates
- Liquidity snapshot creation
- Forecast generation for 30, 60, and 120 minute horizons
- Automatic alert and case creation when a transaction creates liquidity risk

Role behavior:

- `Agent` can view and create transactions for its linked cash point.
- `Management` can create transactions for selected agents.
- `Operator` can view transactions for its assigned provider.

### Liquidity Alerts

Alerts are created from liquidity and transaction risk signals. Alert records include:

- Alert title, type, severity, and status
- Provider context
- AI-style analysis summary, reasoning, recommendation, uncertainty, and limitations
- Evidence items such as liquidity score, provider balance, and transaction amount

Visibility is role-aware:

- `Management` sees critical alerts.
- `Operator` sees high severity alerts for its provider.
- `Field Officer` and `Agent` see alerts connected to their assigned cases.

### Case Management

Cases are generated from alerts and can be managed by authorized roles.

Implemented case features:

- Case listing and case details
- Case timeline
- Case notes
- Escalation records
- Field officer assignment
- Case transfer by `Operator` or `Management`
- Case resolution by assigned `Field Officer` or `Agent`
- Notifications and audit logs for key case actions

### Providers

Management users can maintain mobile financial service providers.

Implemented provider actions:

- List providers
- Add providers
- Remove providers
- Track provider status
- Track provider balances through provider balance records

Seeded providers include:

- bKash
- Nagad
- Rocket

### Agents and Physical Cash

Agents represent cash-point operators in geographic areas.

Implemented agent features:

- List agents
- Create agents from the Management page
- Create linked login users for agents
- Remove agents by marking their code as removed and deactivating the linked user
- Track agent area, phone, code, and physical cash balance

### Field Officers

Field officers are linked to areas and optionally providers. They can receive case assignments and resolve assigned cases.

Implemented field officer features:

- Provider-aware and area-aware field officer listing
- Assignment to cases
- Field officer case visibility
- Assigned case resolution

### Analytics

The analytics module lists stored metrics such as:

- Metric name
- Value
- Trend
- Provider context
- Area context
- Recorded timestamp

### Management Workspace

The Management page supports operational administration:

- Provider creation and removal
- Operator creation and deactivation
- Agent creation and removal
- Area selection for agents
- Agent email/password login provisioning

## Technology Stack

### Backend

- Node.js
- Express 5
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- express-validator request validation
- cors, helmet, morgan

### Frontend

- React 19
- Vite
- React Router
- Axios
- Lucide React icons
- CSS modules/files per page and component

## Project Structure

```text
finSIEM/
  backend/
    prisma/
      schema.prisma
      seed.js
    scripts/
      apply-case-agent-schema.js
      apply-field-officer-schema.js
      apply-provider-assignment-schema.js
      check-field-network.js
      seed-field-officers.js
      smoke-field-officer-workflow.js
    src/
      config/
      controllers/
      middleware/
      repositories/
      routes/
      services/
      utils/
      app.js
      server.js
    package.json
  frontend/
    src/
      components/
      context/
      pages/
      router/
      services/
      utils/
      App.jsx
      main.jsx
    package.json
```

## API Overview

All backend routes are mounted under:

```text
http://localhost:5000/api
```

Main route groups:

| Route | Purpose |
| --- | --- |
| `POST /auth/login` | Login and receive JWT token |
| `GET /auth/me` | Load authenticated user |
| `GET /dashboard` | Load role-specific dashboard data |
| `GET /providers` | List providers |
| `POST /providers` | Create provider, Management only |
| `DELETE /providers/:id` | Remove provider, Management only |
| `GET /agents` | List agents |
| `POST /agents` | Create linked agent account, Management only |
| `DELETE /agents/:id` | Remove agent, Management only |
| `GET /transactions` | List visible transactions |
| `POST /transactions` | Create transaction, Agent or Management |
| `GET /alerts` | List visible alerts |
| `GET /alerts/:id` | Get alert details |
| `GET /cases` | List visible cases |
| `GET /cases/:id` | Get case details |
| `GET /cases/field-officers` | List field officers for assignment |
| `POST /cases/:id/transfer` | Assign/transfer case to field officer |
| `POST /cases/:id/resolve` | Resolve assigned case |
| `GET /analytics` | List analytics metrics |
| `GET /management` | Load management admin data |
| `POST /management/operators` | Create operator |
| `DELETE /management/operators/:id` | Deactivate operator |

## Setup Requirements

Install these before running the project:

- Node.js 18 or newer
- npm
- PostgreSQL database, local or hosted

The current Prisma datasource is PostgreSQL.

## Environment Variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5174

JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DIRECT_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

GEMINI_API_KEY=optional-placeholder
GEMINI_MODEL=gemini-2.0-flash
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Important: never commit real database credentials, JWT secrets, or API keys.

## Installation

From the project root, install dependencies separately:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

## Database Setup

From `backend/`:

```bash
npm run prisma:generate
npm run prisma:push
npm run seed
```

What this does:

- Generates the Prisma client
- Pushes the schema to PostgreSQL
- Seeds roles, providers, areas, users, agents, field officers, balances, transactions, alerts, cases, notifications, and analytics

Optional field officer scripts:

```bash
npm run seed:field-officers
npm run check:field-network
npm run smoke:field-officer
```

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev -- --port 5174
```

Frontend URL:

```text
http://localhost:5174
```

If you use another frontend port, update `FRONTEND_URL` in `backend/.env` and restart the backend.

## Demo Credentials

All seeded demo users use:

```text
Password123!
```

Useful seeded accounts:

| Role | Email |
| --- | --- |
| Management | `management@finsiem.local` |
| Operator | `operator@finsiem.local` |
| bKash Operator | `bkash.operator@finsiem.local` |
| Nagad Operator | `nagad.operator@finsiem.local` |
| Rocket Operator | `rocket.operator@finsiem.local` |
| Agent | `agent@finsiem.local` |
| Uttara Agent | `uttara.agent@finsiem.local` |
| Sylhet Agent | `sylhet.agent@finsiem.local` |
| Field Officer | `fieldofficer@finsiem.local` |
| Uttara Field Officer | `uttara.fieldofficer@finsiem.local` |
| Sylhet Field Officer | `sylhet.fieldofficer@finsiem.local` |

## Build

Build the frontend:

```bash
cd frontend
npm run build
```

Preview the production build:

```bash
cd frontend
npm run preview
```

Run the backend in production-style mode:

```bash
cd backend
npm start
```

## Common Development Workflow

1. Start PostgreSQL or confirm the hosted database is reachable.
2. Start the backend with `npm run dev`.
3. Start the frontend with `npm run dev -- --port 5174`.
4. Open `http://localhost:5174`.
5. Log in with a seeded account.
6. Use Management to create providers, operators, and agents.
7. Use Agent or Management workflows to create transactions.
8. Review generated alerts and cases.
9. Assign cases to field officers and resolve them.

## Troubleshooting

### CORS Error

If the browser says the API is blocked by CORS:

1. Check the frontend URL and port.
2. Set the same origin in `backend/.env`:

```env
FRONTEND_URL=http://localhost:5174
```

3. Restart the backend.

### Invalid Email or Password

Use a seeded account from the demo credentials table. Emails are normalized during login, but the password must match exactly:

```text
Password123!
```

### Backend Cannot Connect to Database

Check:

- `DATABASE_URL`
- `DIRECT_URL`
- Network access to the database host
- Whether Prisma schema has been pushed with `npm run prisma:push`

### Frontend Cannot Reach API

Check `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Then restart the frontend dev server.

### Port Already in Use

Use another frontend port:

```bash
npm run dev -- --port 5175
```

Then update `FRONTEND_URL` in `backend/.env` and restart the backend.

## Security Notes

- Passwords are hashed with bcrypt.
- JWTs are signed with `JWT_SECRET`.
- Protected routes require a Bearer token.
- Role middleware restricts access to Management, Operator, Agent, and Field Officer actions.
- Real `.env` values should not be committed to source control.

## Current Status

Implemented and working:

- Role-based login
- Dashboard
- Provider management
- Agent management with login creation
- Operator management
- Transaction workflow
- Liquidity snapshots and forecasts
- Alert generation
- Case creation, assignment, and resolution
- Analytics listing
- Role-based frontend navigation

