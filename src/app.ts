import "reflect-metadata";
import "dotenv/config";
import express from "express";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import { AppDataSource } from "./config/database";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import logger from "./config/logger";
import { errorHandler } from "./middleware/errorHandler";
import { NotFoundError } from "./errors/AppError";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
// HTTP request logger
app.use((req, _, next) => {
  logger.debug(`${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/health", (_, res) => res.json({ status: "ok", time: new Date() }));

// 404 handler
app.use((_req, _res, next) => next(new NotFoundError("Route not found or check request method")));

// Global error handler
app.use(errorHandler);

// Initialize DB then start server
AppDataSource.initialize()
  .then(() => {
    logger.info("Database connected");
    app.listen(PORT, () => logger.info(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  });

export default app;
