# Finance Dashboard Backend

## Project Overview

Finance Dashboard Backend is a production-oriented Node.js REST API built for financial record management and analytics. It enables secure authentication, role-based permissions, and full CRUD lifecycle support for financial records with Prisma ORM over SQLite.

## Key Features

- JWT-based authentication and session management
- Role-Based Access Control (RBAC) with VIEWER / ANALYST / ADMIN roles
- CRUD operations for financial records
- Soft delete support (logical delete)
- Pagination, filtering, and sorting for record listing
- Dashboard analytics endpoint (totals, category trends, etc.)
- Prisma ORM + SQLite database (development convenience)
- Swagger (OpenAPI) auto-generated docs
- Centralized error handling and request validation middleware

## Tech Stack

- Node.js
- Express.js
- Prisma ORM (SQLite)
- JSON Web Tokens (JWT)
- Swagger (via swagger-jsdoc + swagger-ui-express)
- bcrypt for password hashing

## Folder Structure

```
.
├── src
│   ├── config
│   │   └── env.js
│   ├── middleware
│   │   ├── authenticate.js
│   │   ├── errorHandler.js
│   │   ├── requireRole.js
│   │   └── validate.js
│   ├── modules
│   │   ├── auth
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.service.js
│   │   ├── users
│   │   │   ├── users.controller.js
│   │   │   ├── users.routes.js
│   │   │   └── users.service.js
│   │   ├── records
│   │   │   ├── records.controller.js
│   │   │   ├── records.routes.js
│   │   │   ├── records.service.js
│   │   │   └── records.validation.js
│   │   └── dashboard
│   │       ├── dashboard.controller.js
│   │       ├── dashboard.routes.js
│   │       └── dashboard.service.js
│   ├── prisma
│   │   └── client.js
│   ├── app.js
│   └── server.js
├── prisma
│   ├── schema.prisma
│   └── seed.js
├── .env
├── package.json
└── README.md
```

## Environment Variables

Create `.env` in the project root with:

```env
PORT=3000
JWT_SECRET=your_jwt_secret
DATABASE_URL="file:./dev.db"  # if using SQLite with Prisma
```

Optional:

```env
NODE_ENV=development
```

## Setup Instructions

1. Clone repository

   ```bash
   git clone https://github.com/<your-org>/finance-backend.git
   cd finance-backend
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Configure environment variables (`.env`) as above

4. Initialize Prisma and run migrations

   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. Run the server

   ```bash
   npm start
   ```

6. Verify service

   - Open: `http://localhost:3001/api-docs`
   - Health endpoint: `GET /` (if available)

## API Endpoints Summary

### Auth
- `POST /auth/register` - create user
- `POST /auth/login` - obtain JWT

### Users (admin only)
- `GET /users` - list users

### Records (depends on role)
- `POST /records` - create record (ANALYST, ADMIN)
- `GET /records` - list records (VIEWER/ANALYST/ADMIN)
- `GET /records/:id` - get by id
- `PUT /records/:id` - update record (ANALYST, ADMIN)
- `DELETE /records/:id` - soft delete (ADMIN)

### Dashboard
- `GET /dashboard/analytics` - totals, categories, trends

## Role-Based Access Control

- VIEWER: read-only records + analytics
- ANALYST: create/read/update records + analytics
- ADMIN: full access (users + records + soft delete + analytics)

RBAC is enforced in `src/middleware/requireRole.js` and entry routes.

## Example API Request

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com", "password":"secret"}'
```

Response sample:

```json
{
  "token": "eyJhbGciOiJI...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "ADMIN"
  }
}
```

Authenticated record creation:

```bash
curl -X POST http://localhost:3001/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Q1 Budget","amount":7500,"type":"income","category":"sales"}'
```

## Swagger Documentation

- Documentation available at: `http://localhost:3001/api-docs`
- OpenAPI definition is generated via `src/swagger.js` (or `src/config/docs/openapi.js` if present)
- Includes endpoint details, request/response schemas, and security definitions
Swagger UI showing all available API endpoints.
- [Swagger UI](docs/swagger-ui.png)
## Notes

- Keep `JWT_SECRET` secure.
- Use `npx prisma studio` to inspect database records in development.
- Apply additional middlewares and validations before production deployment.