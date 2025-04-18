import jwt from "jsonwebtoken";
import supertest from "supertest";
import { getRepository } from "typeorm";
import app from "../index";
import { Content } from "../models/Content";
import { Wishlist } from "../models/Wishlist";

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

describe("찜하기/취소 API 테스트", () => {
  let request: any;
  const mockToken = jwt.sign({ id: 1, email: "test@example.com" }, JWT_SECRET, {
    expiresIn: "1h",
  });

  beforeAll(() => {
    request = supertest(app);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 찜하기/취소 API 테스트
  describe("POST /api/contents/:contentId/wishlist", () => {
    it("로그인하지 않은 사용자는 접근할 수 없어야 함", async () => {
      const response = await request.post("/api/contents/1/wishlist");
      expect(response.status).toBe(401);
    });

    it("존재하지 않는 콘텐츠에 대해 404 에러를 반환해야 함", async () => {
      // 모킹 설정: 콘텐츠가 존재하지 않음
      const mockContentRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      (getRepository as jest.Mock).mockImplementation((entity) => {
        if (entity === Content) {
          return mockContentRepository;
        }
        return {};
      });

      const response = await request
        .post("/api/contents/999/wishlist")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("존재하지 않는 콘텐츠입니다.");
      expect(mockContentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it("찜하지 않은 콘텐츠를 찜하면 is_wished가 true로 반환되어야 함", async () => {
      // 모킹 설정: 콘텐츠 존재, 찜 상태 없음
      const mockContentRepository = {
        findOne: jest.fn().mockResolvedValue({ id: 1, title: "테스트 영화" }),
      };

      const mockWishlistRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest
          .fn()
          .mockResolvedValue({ id: 1, user: { id: 1 }, content: { id: 1 } }),
      };

      (getRepository as jest.Mock).mockImplementation((entity) => {
        if (entity === Content) {
          return mockContentRepository;
        } else if (entity === Wishlist) {
          return mockWishlistRepository;
        }
        return {};
      });

      const response = await request
        .post("/api/contents/1/wishlist")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ is_wished: true });
      expect(mockWishlistRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 }, content: { id: 1 } },
      });
      expect(mockWishlistRepository.save).toHaveBeenCalled();
    });

    it("이미 찜한 콘텐츠를 취소하면 is_wished가 false로 반환되어야 함", async () => {
      // 모킹 설정: 콘텐츠 존재, 이미 찜한 상태
      const mockContentRepository = {
        findOne: jest.fn().mockResolvedValue({ id: 1, title: "테스트 영화" }),
      };

      const existingWishlist = { id: 1, user: { id: 1 }, content: { id: 1 } };
      const mockWishlistRepository = {
        findOne: jest.fn().mockResolvedValue(existingWishlist),
        remove: jest.fn().mockResolvedValue(existingWishlist),
      };

      (getRepository as jest.Mock).mockImplementation((entity) => {
        if (entity === Content) {
          return mockContentRepository;
        } else if (entity === Wishlist) {
          return mockWishlistRepository;
        }
        return {};
      });

      const response = await request
        .post("/api/contents/1/wishlist")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ is_wished: false });
      expect(mockWishlistRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 }, content: { id: 1 } },
      });
      expect(mockWishlistRepository.remove).toHaveBeenCalledWith(
        existingWishlist
      );
    });

    it("유효하지 않은 콘텐츠 ID에 대해 400 에러를 반환해야 함", async () => {
      const response = await request
        .post("/api/contents/invalid/wishlist")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("유효하지 않은 콘텐츠 ID입니다.");
    });
  });
});
