# NexaFlow

NexaFlow is a full-stack web application built with React, Node.js, Express, PostgreSQL, Prisma, Paystack, Supabase, and Docker.

The project was built as a practical full-stack application and covers authentication, refresh-token sessions, password reset, Google OAuth, order management, image storage, payment processing, webhooks, database management, caching, and deployment.

------------------------------------------------------------------------

## 1. Project Architecture/Overview

NexaFlow currently allows authenticated users to:

- Register and log in
- Sign in with Google
- Reset a forgotten password
- Verify an OTP
- Maintain a session using access and refresh tokens
- Create an order
- Upload a product image
- Initialize a Paystack payment
- Complete payments through Paystack Test Mode
- Receive payment confirmation through a Paystack webhook
- View order history
- Delete orders
- Keep unfinished Dashboard form data as a temporary local draft

The application is separated into:

```text
Frontend
    React + Vite

Backend
    Node.js + Express

Database
    PostgreSQL + Prisma

External services
    Paystack
    Supabase
    Google OAuth
```

``` text
NexaFlow
│
├── frontend/
│   ├── React
│   ├── React Router
│   ├── Axios
│   ├── React Query
│   └── Google OAuth
│
└── backend/
    ├── Node.js
    ├── Express
    ├── Prisma
    ├── PostgreSQL
    ├── Docker
    ├── Paystack
    └── Supabase Storage
```

### Main flow

``` text
React Frontend
      │
      │ HTTP / HTTPS
      ▼
NexaFlow Express API
      │
      ├──────────────► PostgreSQL
      │                 │
      │                 └── Prisma
      │
      ├──────────────► Supabase Storage
      │                 └── Product images
      │
      └──────────────► Paystack
                        └── Payments + Webhooks
```

------------------------------------------------------------------------

# 2. Frontend

The frontend is built with React.

## Technologies

-   React
-   React Router
-   Axios
-   TanStack React Query
-   Google OAuth
-   CSS
-   Local Storage

## Important frontend areas

``` text
src/
├── components/
│   ├── auth/
│   └── ui/
│
├── pages/
│   ├── Auth/
│   ├── Dashboard/
│   └── OrderHistory/
│
├── routes/
│   └── AppRoutes.jsx
│
├── utils/
│   ├── api.js
│   ├── auth.js
│   └── authFlow.js
│
├── App.jsx
└── main.jsx
```

------------------------------------------------------------------------

# 3. Authentication

NexaFlow uses access tokens and refresh tokens.

## Access token

The access token is used when requesting protected API endpoints.

The frontend currently stores:

``` text
accessToken
user
```

in local storage.

The access token is short-lived, while the refresh token provides a way
to obtain a new access token without forcing the user to log in again.

------------------------------------------------------------------------

# 4. Refresh Token System

Refresh tokens are stored in an HTTP-only cookie.

The backend does not store the raw refresh token.

Instead:

``` text
Refresh Token
      │
      ▼
SHA-256 hash
      │
      ▼
PostgreSQL
```

The database stores the token hash inside:

``` text
RefreshTokenSession
```

Each refresh token session contains information such as:

-   user ID
-   token hash
-   expiration time
-   revoked timestamp

## Refresh flow

``` text
Frontend
   │
   │ Access token expired
   ▼
POST /api/auth/refresh
   │
   ▼
Read refreshToken cookie
   │
   ▼
Hash token
   │
   ▼
Find RefreshTokenSession
   │
   ├── Invalid → 401
   ├── Revoked → 401
   └── Expired → 401
   │
   ▼
Generate new access token
   │
   ▼
Generate new refresh token
   │
   ▼
Revoke old session
   │
   ▼
Create new session
   │
   ▼
Set new HTTP-only cookie
```

This is refresh-token rotation.

------------------------------------------------------------------------

# 5. Logout

Logout performs two important jobs.

### Backend

The logout endpoint invalidates the refresh-token session/cookie.

### Frontend

The frontend clears authentication data and React Query cache.

The current logout flow is:

``` text
POST /api/auth/logout
        │
        ▼
clearAuth()
        │
        ├── accessToken removed
        └── user removed
        │
        ▼
queryClient.clear()
        │
        ▼
Navigate to /auth/login
```

This prevents previously cached user data from remaining visible after
logout.

------------------------------------------------------------------------

# 6. Authentication Pages

The authentication flow includes:

``` text
/auth/login
/auth/signup
/auth/forgot-password
/auth/otp
/auth/reset-password
/auth/success
```

The authentication UI includes:

-   Login
-   Signup
-   Forgot password
-   OTP verification
-   Password reset
-   Success screen
-   Google login

Authentication flow state is persisted where necessary so refreshing the
page does not incorrectly break the password-reset process.

------------------------------------------------------------------------

# 7. Password Requirements

Signup passwords are validated with requirements including:

-   At least 8 characters
-   Lowercase letter
-   Uppercase letter
-   Number
-   Symbol

Passwords are never saved to local storage as drafts.

------------------------------------------------------------------------

# 8. Google OAuth

NexaFlow supports Google authentication.

The frontend receives the Google credential and sends it to:

``` text
POST /api/auth/google
```

The backend verifies the credential and authenticates or creates the
user.

------------------------------------------------------------------------

# 9. Database

NexaFlow uses PostgreSQL with Prisma ORM.

The database contains the application's persistent data.

Important models include:

``` text
User
Order
RefreshTokenSession
```

The exact schema should always be taken from:

``` text
backend/prisma/schema.prisma
```

Database migrations are stored in:

``` text
backend/prisma/migrations/
```

------------------------------------------------------------------------

# 10. Prisma

Prisma is responsible for communication between the Node.js API and
PostgreSQL.

Common commands:

``` bash
npx prisma generate
```

Generate the Prisma client.

``` bash
npx prisma migrate dev
```

Create/apply migrations during development.

``` bash
npx prisma migrate deploy
```

Apply existing migrations in deployment.

``` bash
npx prisma studio
```

Open Prisma Studio.

When Prisma is running inside Docker, remember that the database
hostname is normally the Docker service name rather than `localhost`.

Example:

``` text
postgres:5432
```

------------------------------------------------------------------------

# 11. Docker

NexaFlow uses Docker for the backend and PostgreSQL.

The local setup used:

``` text
Backend container
Host: 5050
Container: 5000

PostgreSQL container
Host: 5433
Container: 5432
```

Therefore:

``` text
http://localhost:5050
```

is the backend address from the host machine.

The PostgreSQL database can be reached from the host using:

``` text
localhost:5433
```

However, from inside the backend Docker container, PostgreSQL should be
reached using the Docker service hostname:

``` text
postgres:5432
```

### Important Docker rule

Do not use:

``` text
localhost:5433
```

for the database connection from inside the API container.

Inside a container, `localhost` means the API container itself.

------------------------------------------------------------------------

# 12. Environment Variables

Environment variables are used for secrets and environment-specific
configuration.

Examples include:

``` env
DATABASE_URL=
FRONTEND_URL=
NODE_ENV=
JWT_SECRET=
REFRESH_TOKEN_SECRET=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
SUPABASE_URL=
SUPABASE_KEY=
GOOGLE_CLIENT_ID=
```

Never commit real production secrets to GitHub.

Use `.env` locally and configure environment variables through the
hosting provider for production.

------------------------------------------------------------------------

# 13. API

The Express API contains routes for:

``` text
/api/auth
/api/orders
/api/payments
/api/health
```

The health endpoint is:

``` text
GET /api/health
```

It checks both the API and database connection.

A successful response confirms that:

``` text
NexaFlow API
+
PostgreSQL
```

are working.

------------------------------------------------------------------------

# 14. CORS

The API uses CORS with credentials enabled.

Conceptually:

``` text
Frontend
   │
   │ credentials: true
   ▼
Express API
   │
   └── CORS allows configured FRONTEND_URL
```

This is important because refresh tokens are stored in cookies.

------------------------------------------------------------------------

# 15. Axios API Client

The frontend uses a shared Axios instance rather than creating separate
Axios requests everywhere.

The shared API client is located at:

``` text
src/utils/api.js
```

Requests to protected endpoints include the current access token.

Cookies are sent using:

``` text
withCredentials: true
```

------------------------------------------------------------------------

# 16. React Query

TanStack React Query is used for server-state management.

The application is configured with settings similar to:

``` javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});
```

## Why React Query?

Without React Query, a page may manually fetch data every time it
mounts.

React Query can:

-   Cache server data
-   Reuse cached data
-   Reduce unnecessary requests
-   Refetch stale data
-   Manage loading states
-   Manage errors
-   Invalidate data after mutations

The logout flow clears the React Query cache:

``` javascript
queryClient.clear();
```

This is important for security and data isolation between users.

------------------------------------------------------------------------

# 17. Dashboard

The dashboard allows the user to enter:

-   Product name
-   Price
-   Product image

The dashboard supports draft persistence.

Draft data is stored temporarily in local storage using:

``` text
nexaflow_dashboard_draft
```

The draft expires after 24 hours.

Passwords and other authentication secrets are not stored as dashboard
drafts.

------------------------------------------------------------------------

# 18. Product Image

Product images are converted to a data URL on the frontend before being
sent to the backend.

Validation includes:

-   File must be an image
-   Maximum size: 5 MB

The backend handles the actual product-image storage using Supabase
Storage.

The resulting image URL is saved with the order.

------------------------------------------------------------------------

# 19. Order Flow

The current order/payment flow is:

``` text
Dashboard
    │
    │ Product name
    │ Price
    │ Image
    ▼
POST /api/payments/initialize
    │
    ▼
Backend
    │
    ├── Upload image
    ├── Create order
    └── Initialize Paystack
    │
    ▼
Paystack
    │
    ▼
Customer completes payment
    │
    ▼
Paystack Webhook
    │
    ▼
POST /api/payments/webhook
    │
    ▼
Verify webhook signature
    │
    ▼
Update order payment status
    │
    ▼
PAID
```

This flow was tested successfully using Paystack Test Mode and an ngrok
webhook endpoint during development.

------------------------------------------------------------------------

# 20. Paystack Webhooks

The webhook is important because the frontend should not be responsible
for deciding whether a payment is successful.

Instead:

``` text
Paystack
   │
   ▼
Webhook
   │
   ▼
Backend verifies signature
   │
   ▼
Database updated
```

The backend therefore has the authoritative payment status.

------------------------------------------------------------------------

# 21. Order History

Users can view their previous orders at:

``` text
/order-history
```

The order history displays:

-   Product
-   Price
-   Date
-   Payment status
-   Product image
-   Delete action

Orders are retrieved from:

``` text
GET /api/orders/history
```

Orders can be deleted through the corresponding protected order
endpoint.

------------------------------------------------------------------------

# 22. Local Storage

NexaFlow uses local storage for limited client-side state.

Current examples include:

``` text
accessToken
user
nexaflow_dashboard_draft
authentication flow state
password-reset flow state
```

Sensitive authentication information such as the refresh token is not
stored in local storage.

The refresh token is handled using an HTTP-only cookie.

------------------------------------------------------------------------

# 23. Local Development

## Frontend

Start the frontend development server:

``` bash
npm run dev
```

The frontend normally runs on a Vite development URL such as:

``` text
http://localhost:5173
```

## Backend

Start the backend according to the project's package scripts.

With Docker:

``` bash
docker compose up --build
```

Check running containers:

``` bash
docker ps
```

View backend logs:

``` bash
docker logs -f nexaflow-api
```

------------------------------------------------------------------------

# 24. Local Ports

Current Docker port mapping:

``` text
Frontend
localhost:5173

Backend
localhost:5050 → container:5000

PostgreSQL
localhost:5433 → container:5432
```

Important distinction:

### From the browser/host

``` text
API:
http://localhost:5050

PostgreSQL:
localhost:5433
```

### From the backend container

``` text
PostgreSQL:
postgres:5432
```

------------------------------------------------------------------------

# 25. Production Deployment

The project was deployed with a hosted backend and PostgreSQL database.

The production architecture can be:

``` text
Vercel / Netlify
       │
       ▼
React Frontend
       │
       ▼
Railway / Render / similar backend host
       │
       ▼
PostgreSQL
```

A separate managed PostgreSQL provider can also be used.

Production environment variables should be configured directly inside
the hosting platform.

------------------------------------------------------------------------

# 26. Render Cold Starts

During development/deployment on Render, the backend may sleep when
there has been no traffic.

This can cause the first request after inactivity to take significantly
longer.

A health endpoint was created:

``` text
GET /api/health
```

A monitoring service such as UptimeRobot can periodically request the
endpoint to reduce idle periods.

Example:

``` text
https://YOUR-API-DOMAIN/api/health
```

A monitoring interval such as five minutes can be used if supported by
the selected monitoring plan.

------------------------------------------------------------------------

# 27. Database Management

The PostgreSQL database can be managed using tools such as:

-   pgAdmin
-   Prisma Studio
-   PostgreSQL-compatible database clients
-   The database provider's dashboard, where available

For local Docker PostgreSQL, the host connection is:

``` text
Host: localhost
Port: 5433
```

For a remote production PostgreSQL database, use the connection
information supplied by the database provider.

------------------------------------------------------------------------

# 28. Clearing Development Data

When testing authentication, orders, and refresh-token behavior,
development data may need to be cleared.

The goal is to delete records while keeping:

-   Database
-   Tables
-   Prisma schema
-   Migrations

intact.

Always be careful when executing destructive SQL against production.

------------------------------------------------------------------------

# 29. Security Principles Used

NexaFlow follows several important security practices:

-   Passwords are hashed before storage.
-   Access tokens are short-lived.
-   Refresh tokens are stored in HTTP-only cookies.
-   Raw refresh tokens are not stored in the database.
-   Refresh tokens are hashed before database storage.
-   Refresh tokens are rotated.
-   Revoked refresh-token sessions cannot be reused.
-   Authentication routes use protected middleware where required.
-   CORS is configured explicitly.
-   Secrets are stored in environment variables.
-   Passwords are not saved in local-storage drafts.
-   Logout clears client authentication state.
-   React Query cache is cleared during logout.

------------------------------------------------------------------------

# 30. Important Production Improvements

Before treating NexaFlow as a production-grade application, the
following areas should be reviewed carefully:

-   Production cookie configuration
-   HTTPS
-   Secure CORS configuration
-   Refresh-token rotation and reuse detection
-   Rate limiting
-   Request validation
-   Password-reset security
-   File upload validation
-   Image size limits
-   Payment webhook idempotency
-   Payment verification
-   Database backups
-   Error logging
-   Monitoring
-   Health checks
-   Environment-variable management
-   PostgreSQL connection pooling
-   API performance
-   Frontend caching strategy
-   Proper authorization for every protected resource

------------------------------------------------------------------------

# 31. Current Development Goal

NexaFlow has been used as a small full-stack practice project to
understand how the pieces of a real application work together.

The major learning progression has been:

``` text
Frontend
   ↓
React
   ↓
Routing
   ↓
Authentication UI
   ↓
Backend API
   ↓
PostgreSQL
   ↓
Prisma
   ↓
Authentication
   ↓
JWT
   ↓
Refresh Tokens
   ↓
HTTP-only Cookies
   ↓
Docker
   ↓
Payments
   ↓
Webhooks
   ↓
Supabase Storage
   ↓
React Query
   ↓
Deployment
```

The next larger project can use these same concepts to build a complete
production-style e-commerce application from scratch.

------------------------------------------------------------------------

# 32. Useful Commands

### Git

``` bash
git status
```

``` bash
git add .
```

``` bash
git commit -m "your message"
```

``` bash
git push origin main
```

### Docker

``` bash
docker ps
```

``` bash
docker compose up --build
```

``` bash
docker compose down
```

``` bash
docker logs -f nexaflow-api
```

### Prisma

``` bash
npx prisma generate
```

``` bash
npx prisma migrate dev
```

``` bash
npx prisma migrate deploy
```

``` bash
npx prisma studio
```

------------------------------------------------------------------------

# 33. Final Notes

NexaFlow is a learning project, but its architecture intentionally
introduces patterns used in real-world full-stack applications.

The most important concepts implemented are:

``` text
Authentication
Authorization
JWT access tokens
Refresh-token sessions
HTTP-only cookies
Token rotation
PostgreSQL
Prisma
Docker
REST APIs
React Query
File storage
Paystack payments
Payment webhooks
CORS
Environment variables
Deployment
```

When making future changes, keep the separation of responsibilities
clear:

``` text
Frontend
→ UI and client state

Backend
→ Business logic and security

Database
→ Persistent application data

Supabase
→ Image storage

Paystack
→ Payment processing

React Query
→ Server-state caching

HTTP-only cookies
→ Refresh-token storage
```

This separation will make the next larger e-commerce project easier to
design, debug, deploy, and maintain.
