import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import recordsRoutes from "./modules/records/records.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import budgetsRoutes from "./modules/budgets/budgets.routes.js";
import goalsRoutes from "./modules/goals/goals.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { openapiSpec } from "./docs/openapi.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/openapi.json", (req, res) => {
  res.json(openapiSpec);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/budgets", budgetsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/ai", aiRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use(errorHandler);

export default app;
