/**
 * OpenAPI 3.0 specification for the Finance Dashboard API.
 * Keep in sync with route modules and Zod schemas.
 */
export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Finance Dashboard API",
    description:
      "REST API for financial records, dashboard analytics, and user management. " +
      "Authenticate with `POST /api/auth/login`, then use **Authorize** and paste `Bearer <token>` (or the raw JWT only, depending on Swagger UI version).",
    version: "1.0.0",
  },
  servers: [{ url: "/", description: "Current server" }],
  tags: [
    { name: "Health", description: "Liveness" },
    { name: "Auth", description: "Registration and login" },
    { name: "Users", description: "User management (ADMIN)" },
    { name: "Records", description: "Financial records CRUD" },
    { name: "Dashboard", description: "Analytics" },
    { name: "Budgets", description: "Category budget tracking" },
    { name: "Goals", description: "Financial goal planning" },
    { name: "AI", description: "AI-powered financial advisor insights" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT from `POST /api/auth/login` or `POST /api/auth/register`.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          details: { type: "object", additionalProperties: true },
        },
      },
      UserPublic: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              token: { type: "string" },
              user: { $ref: "#/components/schemas/UserPublic" },
            },
          },
        },
      },
      RegisterBody: {
        type: "object",
        required: ["email", "name", "password"],
        properties: {
          email: { type: "string", format: "email" },
          name: { type: "string", minLength: 1, maxLength: 200 },
          password: { type: "string", minLength: 8, maxLength: 128 },
        },
      },
      LoginBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 },
        },
      },
      UserListItem: {
        allOf: [
          { $ref: "#/components/schemas/UserPublic" },
          {
            type: "object",
            properties: {
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        ],
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
      UsersListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/UserListItem" },
              },
              pagination: { $ref: "#/components/schemas/Pagination" },
            },
          },
        },
      },
      PatchRoleBody: {
        type: "object",
        required: ["role"],
        properties: {
          role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] },
        },
      },
      PatchStatusBody: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
        },
      },
      PatchUserResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/UserListItem" },
        },
      },
      DeleteUserResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              id: { type: "string" },
              deleted: { type: "boolean", example: true },
            },
          },
        },
      },
      RecordCreator: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string" },
          name: { type: "string" },
        },
      },
      FinancialRecord: {
        type: "object",
        properties: {
          id: { type: "string" },
          amount: { type: "number", format: "float" },
          type: { type: "string", enum: ["INCOME", "EXPENSE"] },
          category: { type: "string" },
          date: { type: "string", format: "date-time" },
          notes: { type: "string", nullable: true },
          createdById: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          deletedAt: { type: "string", format: "date-time", nullable: true },
          createdBy: { $ref: "#/components/schemas/RecordCreator" },
        },
      },
      RecordsListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/FinancialRecord" },
              },
              pagination: { $ref: "#/components/schemas/Pagination" },
            },
          },
        },
      },
      CreateRecordBody: {
        type: "object",
        required: ["amount", "type", "category", "date"],
        properties: {
          amount: { type: "number", exclusiveMinimum: 0 },
          type: { type: "string", enum: ["INCOME", "EXPENSE"] },
          category: { type: "string", minLength: 1, maxLength: 100 },
          date: { type: "string", format: "date-time" },
          notes: { type: "string", maxLength: 2000, nullable: true },
        },
      },
      UpdateRecordBody: {
        type: "object",
        description: "At least one field required (enforced by API validation).",
        properties: {
          amount: { type: "number", exclusiveMinimum: 0 },
          type: { type: "string", enum: ["INCOME", "EXPENSE"] },
          category: { type: "string", minLength: 1, maxLength: 100 },
          date: { type: "string", format: "date-time" },
          notes: { type: "string", maxLength: 2000, nullable: true },
        },
      },
      DeleteRecordResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              id: { type: "string" },
              deleted: { type: "boolean", example: true },
            },
          },
        },
      },
      DashboardSummary: {
        type: "object",
        properties: {
          totalIncome: { type: "number" },
          totalExpense: { type: "number" },
          netBalance: { type: "number" },
        },
      },
      CategoryBreakdownItem: {
        type: "object",
        properties: {
          category: { type: "string" },
          income: { type: "number" },
          expense: { type: "number" },
          net: { type: "number" },
        },
      },
      MonthlyTrendItem: {
        type: "object",
        properties: {
          month: { type: "string", example: "2026-01" },
          income: { type: "number" },
          expense: { type: "number" },
          net: { type: "number" },
        },
      },
      Budget: {
        type: "object",
        properties: {
          id: { type: "string" },
          category: { type: "string" },
          monthlyLimit: { type: "number" },
          month: { type: "integer", minimum: 1, maximum: 12 },
          year: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Goal: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          targetAmount: { type: "number" },
          currentAmount: { type: "number" },
          targetDate: { type: "string", format: "date-time" },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          category: { type: "string" },
          status: { type: "string", enum: ["ON_TRACK", "BEHIND", "COMPLETED"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          progressPercentage: { type: "number" },
          remainingAmount: { type: "number" },
          monthlyRequired: { type: "number" },
          currentSavingsRate: { type: "number" },
          projectedCompletionDate: { type: "string", format: "date-time", nullable: true },
          forecastMessage: { type: "string" },
        },
      },
      CreateGoalBody: {
        type: "object",
        required: ["name", "targetAmount", "currentAmount", "targetDate", "priority", "category"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 150 },
          targetAmount: { type: "number", exclusiveMinimum: 0 },
          currentAmount: { type: "number", minimum: 0 },
          targetDate: { type: "string", format: "date-time" },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          category: { type: "string", minLength: 1, maxLength: 100 },
        },
      },
      UpdateGoalBody: {
        type: "object",
        description: "At least one field required (enforced by API validation).",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 150 },
          targetAmount: { type: "number", exclusiveMinimum: 0 },
          currentAmount: { type: "number", minimum: 0 },
          targetDate: { type: "string", format: "date-time" },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          category: { type: "string", minLength: 1, maxLength: 100 },
        },
      },
      BudgetStatusItem: {
        type: "object",
        properties: {
          id: { type: "string" },
          category: { type: "string" },
          monthlyLimit: { type: "number" },
          month: { type: "integer", minimum: 1, maximum: 12 },
          year: { type: "integer" },
          totalSpent: { type: "number" },
          remaining: { type: "number" },
          percentageUsed: { type: "number" },
          alertLevel: { type: "string", enum: ["safe", "warning", "exceeded"] },
        },
      },
      CreateBudgetBody: {
        type: "object",
        required: ["category", "monthlyLimit", "month", "year"],
        properties: {
          category: { type: "string", minLength: 1, maxLength: 100 },
          monthlyLimit: { type: "number", exclusiveMinimum: 0 },
          month: { type: "integer", minimum: 1, maximum: 12 },
          year: { type: "integer", minimum: 2000 },
        },
      },
      UpdateBudgetBody: {
        type: "object",
        description: "At least one field required (enforced by API validation).",
        properties: {
          category: { type: "string", minLength: 1, maxLength: 100 },
          monthlyLimit: { type: "number", exclusiveMinimum: 0 },
          month: { type: "integer", minimum: 1, maximum: 12 },
          year: { type: "integer", minimum: 2000 },
        },
      },
      AiInsightRequestBody: {
        type: "object",
        description: "Optional question for guided analysis. `forceRefresh=true` bypasses the 12-hour cache.",
        properties: {
          question: { type: "string", minLength: 3, maxLength: 400 },
          forceRefresh: { type: "boolean", default: false },
        },
      },
      AiInsightResponse: {
        type: "object",
        required: ["insightTitle", "insightMessage", "severity", "suggestions"],
        properties: {
          insightTitle: { type: "string" },
          insightMessage: { type: "string" },
          severity: { type: "string", enum: ["info", "warning", "success"] },
          suggestions: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register",
        description: "Creates a user with role `VIEWER`.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterBody" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          409: {
            description: "Email already registered",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginBody" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UsersListResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          403: {
            description: "Forbidden (not ADMIN)",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/users/{id}/role": {
      patch: {
        tags: ["Users"],
        summary: "Update user role",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PatchRoleBody" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatchUserResponse" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/users/{id}/status": {
      patch: {
        tags: ["Users"],
        summary: "Update user status",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PatchStatusBody" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatchUserResponse" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/users/{id}": {
      delete: {
        tags: ["Users"],
        summary: "Soft-delete user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteUserResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/records": {
      get: {
        tags: ["Records"],
        summary: "List financial records",
        description:
          "Requires `VIEWER` or higher. Supports filters and pagination.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "from",
            in: "query",
            description: "ISO date-time",
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "to",
            in: "query",
            description: "ISO date-time",
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "type",
            in: "query",
            schema: { type: "string", enum: ["INCOME", "EXPENSE"] },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RecordsListResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
      post: {
        tags: ["Records"],
        summary: "Create financial record",
        description: "Requires `ANALYST` or higher.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateRecordBody" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/FinancialRecord" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          403: {
            description: "Forbidden (requires ANALYST or higher)",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/records/{id}": {
      get: {
        tags: ["Records"],
        summary: "Get record by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/FinancialRecord" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          404: {
            description: "Not found",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
      patch: {
        tags: ["Records"],
        summary: "Update financial record",
        description: "Requires `ANALYST` or higher.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateRecordBody" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/FinancialRecord" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          404: {
            description: "Not found",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
      delete: {
        tags: ["Records"],
        summary: "Delete financial record",
        description: "Requires `ADMIN`. Soft-delete.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteRecordResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          404: {
            description: "Not found",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Income / expense / net summary",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "from",
            in: "query",
            description: "ISO date-time",
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "to",
            in: "query",
            description: "ISO date-time",
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/DashboardSummary" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/dashboard/category-breakdown": {
      get: {
        tags: ["Dashboard"],
        summary: "Income and expense by category",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "from",
            in: "query",
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "to",
            in: "query",
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/CategoryBreakdownItem",
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/dashboard/recent": {
      get: {
        tags: ["Dashboard"],
        summary: "Recent records",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "from",
            in: "query",
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "to",
            in: "query",
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "limit",
            in: "query",
            description: "Max records to return",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/FinancialRecord" },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/dashboard/monthly-trends": {
      get: {
        tags: ["Dashboard"],
        summary: "Monthly income, expense, and net",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "from",
            in: "query",
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "to",
            in: "query",
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/MonthlyTrendItem",
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/budgets": {
      get: {
        tags: ["Budgets"],
        summary: "List budgets for month/year",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "month",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 12 },
          },
          {
            name: "year",
            in: "query",
            schema: { type: "integer", minimum: 2000 },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        items: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Budget" },
                        },
                        month: { type: "integer" },
                        year: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Budgets"],
        summary: "Create budget",
        description: "Requires ANALYST or ADMIN.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBudgetBody" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Budget" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/budgets/status": {
      get: {
        tags: ["Budgets"],
        summary: "Budget status by category",
        description: "Uses EXPENSE records only to compute spending.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "month",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 12 },
          },
          {
            name: "year",
            in: "query",
            schema: { type: "integer", minimum: 2000 },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/BudgetStatusItem" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/budgets/{id}": {
      put: {
        tags: ["Budgets"],
        summary: "Update budget",
        description: "Requires ANALYST or ADMIN.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateBudgetBody" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Budget" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Budgets"],
        summary: "Delete budget",
        description: "Requires ADMIN.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        deleted: { type: "boolean", example: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/goals": {
      get: {
        tags: ["Goals"],
        summary: "List goals",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        items: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Goal" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Goals"],
        summary: "Create goal",
        description: "Requires ANALYST or ADMIN.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateGoalBody" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Goal" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/goals/forecast": {
      get: {
        tags: ["Goals"],
        summary: "Forecast goals",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Goal" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/goals/{id}": {
      get: {
        tags: ["Goals"],
        summary: "Get goal by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Goal" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Goals"],
        summary: "Update goal",
        description: "Requires ANALYST or ADMIN.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateGoalBody" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Goal" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Goals"],
        summary: "Delete goal",
        description: "Requires ADMIN.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        deleted: { type: "boolean", example: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/ai/insights": {
      post: {
        tags: ["AI"],
        summary: "Generate AI financial insights",
        description:
          "Builds personalized insight from analytics, transactions, budgets, and goals. " +
          "Responses are cached for 12 hours per user/question unless forceRefresh is true.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AiInsightRequestBody" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/AiInsightResponse" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
  },
};
