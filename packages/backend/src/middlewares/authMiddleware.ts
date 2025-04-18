import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { User } from "../models/User";

/**
 * JWT 토큰을 확인하고 사용자 정보를 요청 객체에 추가하는 미들웨어
 *
 * @param options.required - 인증이 필수인지 여부 (기본값: true)
 * @returns 미들웨어 함수
 */
export const authenticate = (
  options: { required: boolean } = { required: true }
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Authorization 헤더에서 토큰 추출
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        // 인증이 필수가 아니면 다음 미들웨어로 진행
        if (!options.required) {
          return next();
        }
        return res.status(401).json({ message: "인증 토큰이 필요합니다." });
      }

      // "Bearer {token}" 형식에서 토큰 부분만 추출
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

      if (!token) {
        // 인증이 필수가 아니면 다음 미들웨어로 진행
        if (!options.required) {
          return next();
        }
        return res
          .status(401)
          .json({ message: "유효하지 않은 인증 토큰 형식입니다." });
      }

      // 환경 변수에서 JWT 시크릿 키 가져오기
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        console.error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
        return res
          .status(500)
          .json({ message: "서버 구성 오류가 발생했습니다." });
      }

      // JWT 토큰 검증
      const decoded = jwt.verify(token, jwtSecret) as {
        id: number;
        email: string;
      };

      // 사용자 정보 조회
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.id } });

      if (!user) {
        return res.status(401).json({ message: "유효하지 않은 사용자입니다." });
      }

      if (!user.is_active) {
        return res.status(401).json({ message: "비활성화된 계정입니다." });
      }

      // req.user에 사용자 정보 추가
      req.user = user;

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        // 인증이 필수가 아니면 다음 미들웨어로 진행
        if (!options.required) {
          return next();
        }
        return res
          .status(401)
          .json({ message: "유효하지 않은 인증 토큰입니다." });
      }

      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "인증 토큰이 만료되었습니다." });
      }

      console.error("인증 미들웨어 에러:", error);
      res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
  };
};
