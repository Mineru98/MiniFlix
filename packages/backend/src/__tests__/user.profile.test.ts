import jwt from "jsonwebtoken";
import supertest from "supertest";
import { getRepository } from "typeorm";
import app from "../index";
import { User } from "../models/User";

// JWT 시크릿 설정
const JWT_SECRET = process.env.JWT_SECRET || "test_secret";

// 모킹
jest.mock("typeorm", () => {
  const originalModule = jest.requireActual("typeorm");
  return {
    ...originalModule,
    getRepository: jest.fn(),
    createConnection: jest.fn(),
  };
});

describe("계정 정보 조회 API 테스트", () => {
  let request: any;
  const mockToken = jwt.sign({ id: 1, email: "test@example.com" }, JWT_SECRET, {
    expiresIn: "1h",
  });
  const mockExpiredToken = jwt.sign(
    { id: 1, email: "test@example.com" },
    JWT_SECRET,
    { expiresIn: "0s" }
  );

  beforeAll(() => {
    request = supertest(app);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users/profile", () => {
    it("로그인하지 않은 사용자는 접근할 수 없어야 함", async () => {
      const response = await request.get("/api/users/profile");
      expect(response.status).toBe(401);
    });

    it("만료된 토큰으로 접근하면 401 에러를 반환해야 함", async () => {
      // 토큰이 만료될 시간을 기다림
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${mockExpiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("인증 토큰이 만료되었습니다.");
    });

    it("존재하지 않는 사용자는 401 에러를 반환해야 함", async () => {
      // 모킹 설정: 사용자가 존재하지 않음
      const mockUserRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      (getRepository as jest.Mock).mockImplementation((entity) => {
        if (entity === User) {
          return mockUserRepository;
        }
        return {};
      });

      const response = await request
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("존재하지 않는 사용자입니다.");
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("비활성화된 계정은 403 에러를 반환해야 함", async () => {
      // 모킹 설정: 사용자는 있지만 비활성화됨
      const mockUserRepository = {
        findOne: jest.fn().mockResolvedValue({
          id: 1,
          email: "test@example.com",
          name: "테스트 사용자",
          created_at: new Date(),
          is_active: false,
        }),
      };

      (getRepository as jest.Mock).mockImplementation((entity) => {
        if (entity === User) {
          return mockUserRepository;
        }
        return {};
      });

      const response = await request
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("비활성화된 계정입니다.");
    });

    it("유효한 사용자는 계정 정보를 반환해야 함", async () => {
      // 모킹 설정: 유효한 사용자
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "테스트 사용자",
        created_at: new Date("2023-01-01"),
        is_active: true,
      };

      const mockUserRepository = {
        findOne: jest.fn().mockResolvedValue(mockUser),
      };

      (getRepository as jest.Mock).mockImplementation((entity) => {
        if (entity === User) {
          return mockUserRepository;
        }
        return {};
      });

      const response = await request
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        email: "test@example.com",
        name: "테스트 사용자",
        created_at: mockUser.created_at.toISOString(),
        is_active: true,
      });
    });

    it("잘못된 형식의 토큰으로 접근하면 401 에러를 반환해야 함", async () => {
      const response = await request
        .get("/api/users/profile")
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("유효하지 않은 인증 토큰입니다.");
    });
  });
});
