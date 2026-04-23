import express, { Application, Request, Response } from "express";
import { env } from "./config/environment";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import { connectDB } from "./db/connection";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import "./firebase/admin";

// Import routes
import authRoutes from "./routes/auth.routes";
import guideRoutes from "./routes/guide.routes";
import bookingRoutes from "./routes/booking.routes";
import reviewRoutes from "./routes/review.routes";
import paymentRoutes from "./routes/payment.routes";
import adminDashboardRoutes from "./routes/adminDashboard.routes";
import adminRoutes from "./routes/admin.routes";
import cabRoutes from "./routes/cab.routes";
import driverRoutes from "./routes/driver.routes";
import passRoutes from "./routes/pass.routes";
import tourPackageRoutes from "./routes/tourPackage.routes";
import settingsRoutes from "./routes/setting.routes";
import notificationRoutes from "./routes/notification.routes";
import payoutRoutes from "./routes/payout.routes";

const app: Application = express();
dotenv.config();

// Middleware
app.use(
  express.json({
    limit: "10mb",
    verify: (req: Request & { rawBody?: Buffer }, _res, buf) => {
      req.rawBody = Buffer.from(buf);
    },
  }),
);
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps/postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/adminDashboard", adminDashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cabs", cabRoutes);
app.use("/api/passes", passRoutes);
app.use("/api/packages", tourPackageRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payout", payoutRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = env.PORT;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, () => {
      logger.info(
        `Server running on port ${PORT} in ${env.NODE_ENV} environment`,
      );
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
};

startServer();

export default app;
