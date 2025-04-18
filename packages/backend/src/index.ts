import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import expressPino from "express-pino-logger";
import helmet from "helmet";
import pino from "pino";

// Environment variables
dotenv.config();

// Logger setup
const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const expressLogger = expressPino({ logger });

// Express app
const app = express();

// Middleware
app.use(expressLogger);
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base route
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
