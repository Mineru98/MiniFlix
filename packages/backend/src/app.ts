import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { ValidateError } from "tsoa";
import { RegisterRoutes } from "./routes";
import { AppError } from "./utils/errors";

const app = express();

// 미들웨어
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression() as unknown as express.RequestHandler);

// TSOA 라우트 등록
RegisterRoutes(app);

// 에러 핸들링 미들웨어
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof ValidateError) {
      return res.status(400).json({
        message: "요청 데이터가 유효하지 않습니다.",
        details: err.fields,
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

export { app };
