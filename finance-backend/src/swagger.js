import swaggerUi from "swagger-ui-express";

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Finance Dashboard API",
    version: "1.0.0",
    description: "Finance Dashboard backend API documentation (Express + Prisma + SQLite + JWT + Zod)",
  },
  servers: [{ url: "/", description: "Local server" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Credentials: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
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
          createdBy: { $ref: "#/components/schemas/User" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
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
      RecordSummary: {
        type: "object",
        properties: {
          totalIncome: { type: "number" },
          totalExpense: { type: "number" },
          netBalance: { type: "number" },
        },
      },
      CategoryBreakdown: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: { type: "string" },
            income: { type: "number" },
            expense: { type: "number" },
            net: { type: "number" },
          },
        },
      },
      TrendRecord: {
        type: "object",
        properties: {
          month: { type: "string" },
          income: { type: "number" },
          expense: { type: "number" },
          net: { type: "number" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "name", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  name: { type: "string" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/AuthResponse" } } } } } },
          "400": { description: "Validation error" },
          "409": { description: "Email already exists" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate and issue a JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Credentials" },
            },
          },
        },
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/AuthResponse" } } } } } },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List users (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          "200": { description: "OK" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/users/{id}/role": {
      patch: {
        tags: ["Users"],
        summary: "Update a user role (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] } }, required: ["role"] } } } },
        responses: { "200": { description: "OK" }, "404": { description: "User not found" } },
      },
    },
    "/api/users/{id}/status": {
      patch: {
        tags: ["Users"],
        summary: "Update a user status (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", enum: ["ACTIVE", "INACTIVE"] } }, required: ["status"] } } } },
        responses: { "200": { description: "OK" }, "404": { description: "User not found" } },
      },
    },
    "/api/users/{id}": {
      delete: {
        tags: ["Users"],
        summary: "Soft delete a user (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" }, "404": { description: "User not found" } },
      },
    },
    "/api/records": {
      get: {
        tags: ["Records"],
        summary: "List records",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "from", in: "query", schema: { type: "string", format: "date" } },
          { name: "to", in: "query", schema: { type: "string", format: "date" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "type", in: "query", schema: { type: "string", enum: ["INCOME", "EXPENSE"] } },
        ],
        responses: { "200": { description: "OK" }, "401": { description: "Unauthorized" } },
      },
      post: {
        tags: ["Records"],
        summary: "Create record (analyst+)",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["amount","type","category","date"], properties: { amount: { type: "number" }, type: { type: "string", enum: ["INCOME", "EXPENSE"] }, category: { type: "string" }, date: { type: "string", format: "date-time" }, notes: { type: "string" } } } } } },
        responses: { "201": { description: "Created" }, "400": { description: "Validation failed" } },
      },
    },
    "/api/records/{id}": {
      get: {
        tags: ["Records"],
        summary: "Get record by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" }, "404": { description: "Record not found" } },
      },
      patch: {
        tags: ["Records"],
        summary: "Update record (analyst+)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { amount: { type: "number" }, type: { type: "string", enum: ["INCOME", "EXPENSE"] }, category: { type: "string" }, date: { type: "string", format: "date-time" }, notes: { type: "string" } } } } } },
        responses: { "200": { description: "OK" }, "404": { description: "Record not found" } },
      },
      delete: {
        tags: ["Records"],
        summary: "Delete record (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" }, "404": { description: "Record not found" } },
      },
    },
    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Dashboard summary",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "from", in: "query", schema: { type: "string", format: "date" } },
          { name: "to", in: "query", schema: { type: "string", format: "date" } },
        ],
        responses: { "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/RecordSummary" } } } } },
      },
    },
    "/api/dashboard/category-breakdown": {
      get: {
        tags: ["Dashboard"],
        summary: "Category breakdown",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryBreakdown" } } } } },
      },
    },
    "/api/dashboard/recent": {
      get: {
        tags: ["Dashboard"],
        summary: "Recent records",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 10 } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/dashboard/monthly-trends": {
      get: {
        tags: ["Dashboard"],
        summary: "Monthly trends",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/TrendRecord" } } } } } },
      },
    },
  },
};

export function setupSwagger(app) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
