import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import expressPino from "express-pino-logger";
import helmet from "helmet";
import pino from "pino";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { UserController } from "./controllers/UserController";
import apiRoutes from "./routes";
import { AppError } from "./utils/errors";

// Environment variables
dotenv.config();

// Logger setup
const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const expressLogger = expressPino({ logger: logger as any });

// Express app
const app = express();

// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API 문서",
      version: "1.0.0",
      description: "API 문서화",
    },
    servers: [
      {
        url: "/api",
      },
    ],
  },
  apis: ["./src/controllers/*.ts", "./src/models/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Middleware
app.use(expressLogger);
app.use(helmet());
app.use(compression() as unknown as express.RequestHandler);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve as any[],
  swaggerUi.setup(swaggerSpec) as any
);

// 라우터 설정
const userController = new UserController();
app.use("/api/users", userController.router);

// API 라우터 등록
app.use("/api", apiRoutes);

// Base route
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running" });
});

// 에러 핸들링 미들웨어
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err.name === "ValidationError" || err.name === "SyntaxError") {
      return res.status(400).json({
        message: "요청 데이터가 유효하지 않습니다.",
        details: err.details || err.message,
      });
    }

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        message: err.message,
      });
    }

    // 예상치 못한 에러
    console.error(err);
    return res.status(500).json({
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
