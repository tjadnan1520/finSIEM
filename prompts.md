# finSIEM Project Prompts

This file documents the main prompts that can be used to build the finSIEM project step by step. Each prompt is paired with the actual work it represents in the current project.

The prompts are written in a practical order: start with the product idea, build the backend, connect the database, create the frontend, add role-based workflows, then polish and document the project.

## 1. Project Concept and Scope

### Prompt

```text
Build a full-stack financial SIEM-style system named finSIEM for mobile financial service operations. The system should monitor liquidity, provider balances, physical cash, cash-in/cash-out transactions, alerts, and operational cases. It should support role-based access for Management, Operator, Agent, and Field Officer users.
```

### Work Done

- Defined finSIEM as a role-based financial operations and liquidity monitoring platform.
- Planned separate backend and frontend applications.
- Identified the major modules:
  - Authentication
  - Dashboard
  - Providers
  - Agents
  - Transactions
  - Liquidity alerts
  - Cases
  - Analytics
  - Management tools

## 2. Backend Foundation

### Prompt

```text
Create the backend using Node.js, Express, Prisma, and PostgreSQL. Add middleware for JSON parsing, CORS, security headers, request logging, not-found handling, and centralized error handling.
```

### Work Done

- Created the backend Express application.
- Added `helmet`, `cors`, `morgan`, and JSON body parsing.
- Mounted all backend routes under `/api`.
- Added `/api/health` for backend health checks.
- Added centralized error and 404 middleware.
- Configured environment loading through `backend/.env`.

## 3. Database Schema

### Prompt

```text
Design a Prisma schema for a financial operations system with users, roles, providers, agents, areas, physical cash, provider balances, transactions, liquidity snapshots, forecasts, AI analysis, alerts, evidence, cases, assignments, escalations, notes, timelines, notifications, audit logs, and analytics.
```

### Work Done

- Created `backend/prisma/schema.prisma`.
- Added role and user models.
- Added provider, agent, area, physical cash, and provider balance models.
- Added transaction models with `CASH_IN` and `CASH_OUT`.
- Added liquidity snapshot and forecast models.
- Added alert, evidence, and AI analysis models.
- Added case management models:
  - Case
  - Assignment
  - Escalation
  - CaseNote
  - Timeline
- Added notification, audit log, and analytics models.

## 4. Seed Data

### Prompt

```text
Create realistic seed data for finSIEM. Include Management, Operator, Agent, and Field Officer users; providers like bKash, Nagad, and Rocket; Bangladeshi areas; physical cash balances; provider balances; sample transactions; alerts; cases; notifications; audit logs; and analytics.
```

### Work Done

- Created `backend/prisma/seed.js`.
- Seeded roles:
  - Management
  - Operator
  - Agent
  - Field Officer
- Seeded demo users with `Password123!`.
- Seeded providers:
  - bKash
  - Nagad
  - Rocket
- Seeded areas across Bangladesh.
- Seeded agents and field officers linked to areas.
- Seeded physical cash and provider balances.
- Seeded operational data such as transactions, alerts, cases, notifications, and analytics.

## 5. Authentication

### Prompt

```text
Implement JWT authentication with bcrypt password verification. Add login and current-user endpoints. Return sanitized user data including role and linked agent or provider context.
```

### Work Done

- Added `POST /api/auth/login`.
- Added `GET /api/auth/me`.
- Implemented bcrypt password comparison.
- Implemented JWT signing.
- Added auth middleware for protected routes.
- Added role authorization middleware.
- Returned role-aware user context:
  - Operator provider details
  - Agent details
  - Field officer details
- Improved login email handling by trimming and lowercasing email values.

## 6. Role-Based API Access

### Prompt

```text
Protect backend APIs using authenticated routes and role-based authorization. Management should have broad access, Operators should be provider-scoped, Agents should be cash-point scoped, and Field Officers should only see assigned work.
```

### Work Done

- Protected dashboard, providers, agents, transactions, alerts, cases, analytics, and management routes.
- Added role checks for sensitive actions.
- Scoped data visibility based on user role:
  - Operators see provider-specific transactions, alerts, and cases.
  - Agents see their linked cash-point transactions and assigned work.
  - Field Officers see assigned cases and alerts.
  - Management sees critical operational and administrative data.

## 7. Dashboard API

### Prompt

```text
Build a dashboard service that returns role-specific summary cards, recent transactions, recent alerts, open cases, and AI-style recommendations where available.
```

### Work Done

- Created dashboard controller, service, and repository.
- Added `GET /api/dashboard`.
- Built role-specific dashboard summaries.
- Added recent transaction formatting.
- Added recent alert formatting.
- Added case summary formatting.
- Added short-lived backend dashboard caching.
- Invalidated dashboard cache when transactions are created.

## 8. Provider Module

### Prompt

```text
Create provider APIs and frontend screens. Management should be able to add and remove providers. Other roles should be able to view provider data according to their access level.
```

### Work Done

- Added provider repository, service, controller, and routes.
- Added provider listing.
- Added provider creation for Management.
- Added provider removal for Management.
- Built the frontend Providers page.
- Connected provider services through Axios.

## 9. Agent Module

### Prompt

```text
Create agent APIs and frontend management tools. Management should be able to create agents with name, email, password, code, phone, and area. New agents must be able to log in.
```

### Work Done

- Added agent repository, service, controller, and routes.
- Added agent listing.
- Added agent creation for Management.
- Added linked `User` creation for new agents.
- Added bcrypt password hashing for new agent accounts.
- Added agent removal and linked user deactivation.
- Updated the Management frontend form to include agent email and password.
- Verified new agent login.

## 10. Transaction Workflow

### Prompt

```text
Implement cash-in and cash-out transaction workflows. Update provider balances and agent physical cash, create liquidity snapshots and forecasts, and automatically create alerts and cases when risk thresholds are crossed.
```

### Work Done

- Added transaction repository, service, controller, and routes.
- Added transaction listing.
- Added transaction creation for Agent and Management roles.
- Validated transaction type, amount, phone number, provider, and agent.
- Updated provider balances.
- Updated physical cash balances.
- Created liquidity snapshots.
- Created forecasts for 30, 60, and 120 minute horizons.
- Created alerts for high-risk liquidity events.
- Created evidence and AI-style analysis records.
- Created cases from alerts.
- Created notifications and audit logs.

## 11. Alert Module

### Prompt

```text
Build an alert module that lists role-visible alerts and shows alert details including provider, severity, evidence, AI analysis, and linked case information.
```

### Work Done

- Added alert controller, service, and routes.
- Added `GET /api/alerts`.
- Added `GET /api/alerts/:id`.
- Added role-aware alert visibility.
- Added alert detail formatting with:
  - Evidence
  - AI analysis
  - Linked case
  - Timeline
  - Assignments
- Built frontend Alerts and Alert Details pages.

## 12. Case Management

### Prompt

```text
Create case management APIs and frontend pages. Operators and Management should assign or transfer cases to field officers. Assigned Field Officers and Agents should be able to resolve cases.
```

### Work Done

- Added case controller, service, and routes.
- Added case listing and case details.
- Added field officer lookup for assignment.
- Added case transfer endpoint.
- Added case resolution endpoint.
- Added role-aware case visibility.
- Enforced provider and area matching for field officer assignment.
- Added timeline records for assignment and resolution.
- Added notifications and audit logs for case actions.
- Built frontend Cases and Case Details pages.

## 13. Analytics

### Prompt

```text
Create an analytics module that lists stored operational metrics with values, trends, provider context, area context, and timestamps.
```

### Work Done

- Added analytics service, controller, and route.
- Added `GET /api/analytics`.
- Listed recent analytics records.
- Built frontend Analytics page.

## 14. Management Workspace

### Prompt

```text
Build a Management page where management users can maintain providers, operators, and agents. Operators should have login accounts. Agents should also have login accounts linked to cash points.
```

### Work Done

- Added management service, controller, and routes.
- Added `GET /api/management`.
- Added operator creation with email and password.
- Added operator deactivation.
- Connected provider and agent management actions.
- Built frontend Management page.
- Added forms for:
  - Providers
  - Operators
  - Agents
- Displayed management data in role-protected UI panels.

## 15. Frontend Foundation

### Prompt

```text
Create a React frontend with Vite. Add routing, protected routes, auth context, Axios API services, reusable layout components, and role-based navigation.
```

### Work Done

- Created React/Vite frontend.
- Added React Router routes.
- Added AuthContext for login, logout, token storage, and current user loading.
- Added Axios API client with Bearer token injection.
- Added protected route handling.
- Added shared layout:
  - Navbar
  - Sidebar
  - Footer
  - RoleLayout
- Added role-specific menu configuration.

## 16. Frontend Pages

### Prompt

```text
Build frontend pages for Home, Login, Dashboard, Transactions, Alerts, Alert Details, Cases, Case Details, Analytics, Providers, Management, Profile, and Not Found.
```

### Work Done

- Built the Home page.
- Built the Login page.
- Built the Dashboard page with dashboard components.
- Built Transactions page with transaction form and table.
- Built Alerts and Alert Details pages.
- Built Cases and Case Details pages.
- Built Analytics page.
- Built Providers page.
- Built Management page.
- Built Profile page.
- Built Not Found page.

## 17. UI Components

### Prompt

```text
Create reusable frontend components for dashboard summaries, liquidity overview, provider balances, recent alerts, recent transactions, AI recommendations, transaction forms, transaction tables, loader states, and role-aware layout.
```

### Work Done

- Added dashboard components:
  - SummaryCards
  - LiquidityOverview
  - ProviderBalance
  - RecentAlerts
  - RecentTransactions
  - AIRecommendation
- Added transaction components:
  - TransactionForm
  - TransactionTable
- Added common Loader component.
- Added layout components:
  - Navbar
  - Sidebar
  - Footer
  - RoleLayout

## 18. Environment and CORS Fix

### Prompt

```text
Fix the frontend/backend connection so the Vite frontend can call the Express backend without CORS errors. Make sure the frontend base URL and backend allowed origin are aligned.
```

### Work Done

- Set frontend API base URL to `http://localhost:5000/api`.
- Set backend `FRONTEND_URL` to the active Vite origin.
- Restarted backend after `.env` changes.
- Verified:
  - Frontend page loads
  - Backend health endpoint works
  - CORS preflight succeeds
  - Login succeeds from the browser origin

## 19. Agent Login Fix

### Prompt

```text
Fix agent login. Newly created agents from the Management page should not show invalid email or password. They should have real login users linked to their agent records.
```

### Work Done

- Found that old Management agent creation only created `Agent` records, not login `User` records.
- Updated backend agent creation to create a linked `User` with role `Agent`.
- Added email/password validation to agent creation.
- Updated Management UI to collect agent email and password.
- Added linked user deactivation when an agent is removed.
- Verified temporary agent creation, login, and removal.

## 20. Management Login Fix

### Prompt

```text
Fix Management login showing invalid for normal input mistakes like uppercase email or spaces.
```

### Work Done

- Updated backend login validation to trim email input.
- Updated backend auth service to normalize emails with trim and lowercase.
- Updated frontend login submit to trim and lowercase email before sending.
- Verified that `MANAGEMENT@FINSIEM.LOCAL` with spaces logs in successfully.
- Verified Management API loads after login.

## 21. README Documentation

### Prompt

```text
Create a proper README file for this project. Clearly describe the whole project, all applied functionality, setup procedure, role behavior, API overview, demo credentials, build commands, troubleshooting, and security notes.
```

### Work Done

- Created `README.md`.
- Documented project purpose.
- Documented backend and frontend architecture.
- Documented implemented functionality.
- Documented API route groups.
- Added setup requirements.
- Added backend and frontend `.env` examples.
- Added installation steps.
- Added database setup steps.
- Added demo credentials.
- Added local run and build commands.
- Added troubleshooting and security notes.

## 22. Prompt History Documentation

### Prompt

```text
Create a prompts.md file where the prompts used to build the whole project are written one after another. Include the actual work done by each prompt.
```

### Work Done

- Created this `PROMPTS.md` file.
- Organized the project build process into sequential prompts.
- Added the implemented work for each prompt.
- Made the file useful as a development history and project explanation artifact.

