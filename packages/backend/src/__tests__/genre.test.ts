import jwt from "jsonwebtoken";
import request from "supertest";
import { getRepository } from "typeorm";
import app from "../index";

// 모킹
jest.mock("typeorm", () => {
  const originalTypeorm = jest.requireActual("typeorm");
  return {
    ...originalTypeorm,
    getRepository: jest.fn(),
    getManager: jest.fn(),
  };
});

jest.mock("jsonwebtoken");

describe("장르 API 테스트", () => {
  // 테스트 전 모킹 설정
  beforeEach(() => {
    // Genre 리포지토리 모킹
    (getRepository as jest.Mock).mockImplementation(() => ({
      find: jest.fn().mockResolvedValue([
        { id: 1, name: "액션", description: "액션 영화" },
        { id: 2, name: "코미디", description: "코미디 영화" },
        { id: 3, name: "드라마", description: "드라마 영화" },
      ]),
    }));

    // JWT 검증 모킹
    (jwt.verify as jest.Mock).mockImplementation(() => ({
      id: 1,
      email: "test@example.com",
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/genres", () => {
    it("장르 목록을 조회할 수 있어야 함", async () => {
      const response = await request(app).get("/api/genres");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("genres");
      expect(response.body.genres).toHaveLength(3);
      expect(response.body.genres[0]).toHaveProperty("id", 1);
      expect(response.body.genres[0]).toHaveProperty("name", "액션");
      expect(response.body.genres[0]).toHaveProperty(
        "description",
        "액션 영화"
      );
    });

    it("서버 에러 발생 시 500 에러를 반환해야 함", async () => {
      // 에러 발생하도록 모킹 변경
      (getRepository as jest.Mock).mockImplementation(() => ({
        find: jest.fn().mockRejectedValue(new Error("DB 조회 실패")),
      }));

      const response = await request(app).get("/api/genres");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "message",
        "서버 에러가 발생했습니다."
      );
    });
  });
});
