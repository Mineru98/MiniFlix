import bcrypt from "bcrypt";
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

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe("계정 정보 수정 API 테스트", () => {
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

  describe("PUT /api/users/profile", () => {
    it("로그인하지 않은 사용자는 접근할 수 없어야 함", async () => {
      const response = await request.put("/api/users/profile").send({
        name: "새 이름",
        current_password: "current_password",
      });
      expect(response.status).toBe(401);
    });

    it("만료된 토큰으로 접근하면 401 에러를 반환해야 함", async () => {
      // 토큰이 만료될 시간을 기다림
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${mockExpiredToken}`)
        .send({
          name: "새 이름",
          current_password: "current_password",
        });

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
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          name: "새 이름",
          current_password: "current_password",
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("존재하지 않는 사용자입니다.");
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
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          name: "새 이름",
          current_password: "current_password",
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("비활성화된 계정입니다.");
    });

    it("현재 비밀번호가 일치하지 않으면 401 에러를 반환해야 함", async () => {
      // 모킹 설정: 유효한 사용자
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "테스트 사용자",
        password_hash: "hashed_password",
        created_at: new Date(),
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

      // 비밀번호 비교 모킹 (불일치)
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          name: "새 이름",
          current_password: "wrong_password",
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("현재 비밀번호가 일치하지 않습니다.");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrong_password",
        "hashed_password"
      );
    });

    it("변경할 내용이 없으면 400 에러를 반환해야 함", async () => {
      // 모킹 설정: 유효한 사용자
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "테스트 사용자",
        password_hash: "hashed_password",
        created_at: new Date(),
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

      // 비밀번호 비교 모킹 (일치)
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          current_password: "current_password",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("변경할 정보를 제공해주세요.");
    });

    it("새 비밀번호가 8자 미만이면 400 에러를 반환해야 함", async () => {
      // 모킹 설정: 유효한 사용자
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "테스트 사용자",
        password_hash: "hashed_password",
        created_at: new Date(),
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

      // 비밀번호 비교 모킹 (일치)
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          new_password: "1234",
          current_password: "current_password",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "새 비밀번호는 최소 8자 이상이어야 합니다."
      );
    });

    it("이름 업데이트가 성공적으로 이루어져야 함", async () => {
      // 모킹 설정: 유효한 사용자
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "테스트 사용자",
        password_hash: "hashed_password",
        created_at: new Date("2023-01-01"),
        is_active: true,
      };

      const mockUserRepository = {
        findOne: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      (getRepository as jest.Mock).mockImplementation((entity) => {
        if (entity === User) {
          return mockUserRepository;
        }
        return {};
      });

      // 비밀번호 비교 모킹 (일치)
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // 업데이트 후 조회 결과 설정
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser) // 첫 번째 호출 (초기 사용자 조회)
        .mockResolvedValueOnce({
          // 두 번째 호출 (업데이트 후 조회)
          ...mockUser,
          name: "새 이름",
        });

      const response = await request
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          name: "새 이름",
          current_password: "current_password",
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        email: "test@example.com",
        name: "새 이름",
        created_at: mockUser.created_at.toISOString(),
        is_active: true,
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        name: "새 이름",
        updated_at: expect.any(Date),
      });
    });

    it("비밀번호 업데이트가 성공적으로 이루어져야 함", async () => {
      // 모킹 설정: 유효한 사용자
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "테스트 사용자",
        password_hash: "hashed_password",
        created_at: new Date("2023-01-01"),
        is_active: true,
      };

      const mockUserRepository = {
        findOne: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      (getRepository as jest.Mock).mockImplementation((entity) => {
        if (entity === User) {
          return mockUserRepository;
        }
        return {};
      });

      // 비밀번호 비교 모킹 (일치)
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      // 비밀번호 해싱 모킹
      (bcrypt.hash as jest.Mock).mockResolvedValue("new_hashed_password");

      // 업데이트 후 조회 결과 설정
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser) // 첫 번째 호출 (초기 사용자 조회)
        .mockResolvedValueOnce({
          // 두 번째 호출 (업데이트 후 조회)
          ...mockUser,
          password_hash: "new_hashed_password",
        });

      const response = await request
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          new_password: "new_password_12345",
          current_password: "current_password",
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        email: "test@example.com",
        name: "테스트 사용자",
        created_at: mockUser.created_at.toISOString(),
        is_active: true,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("new_password_12345", 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        password_hash: "new_hashed_password",
        updated_at: expect.any(Date),
      });
    });

    it("이름과 비밀번호 모두 업데이트가 성공적으로 이루어져야 함", async () => {
      // 모킹 설정: 유효한 사용자
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "테스트 사용자",
        password_hash: "hashed_password",
        created_at: new Date("2023-01-01"),
        is_active: true,
      };

      const mockUserRepository = {
        findOne: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      (getRepository as jest.Mock).mockImplementation((entity) => {
        if (entity === User) {
          return mockUserRepository;
        }
        return {};
      });

      // 비밀번호 비교 모킹 (일치)
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      // 비밀번호 해싱 모킹
      (bcrypt.hash as jest.Mock).mockResolvedValue("new_hashed_password");

      // 업데이트 후 조회 결과 설정
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser) // 첫 번째 호출 (초기 사용자 조회)
        .mockResolvedValueOnce({
          // 두 번째 호출 (업데이트 후 조회)
          ...mockUser,
          name: "새 이름",
          password_hash: "new_hashed_password",
        });

      const response = await request
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          name: "새 이름",
          new_password: "new_password_12345",
          current_password: "current_password",
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        email: "test@example.com",
        name: "새 이름",
        created_at: mockUser.created_at.toISOString(),
        is_active: true,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("new_password_12345", 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        name: "새 이름",
        password_hash: "new_hashed_password",
        updated_at: expect.any(Date),
      });
    });
  });
});
