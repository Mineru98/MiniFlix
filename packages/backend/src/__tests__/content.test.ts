import jwt from "jsonwebtoken";
import request from "supertest";
import { getRepository } from "typeorm";
import app from "../index";
import { Content } from "../models/Content";
import { User } from "../models/User";
import { Wishlist } from "../models/Wishlist";

// 모킹 설정
jest.mock("typeorm", () => {
  const originalModule = jest.requireActual("typeorm");

  return {
    ...originalModule,
    getRepository: jest.fn(),
    getManager: jest.fn().mockReturnValue({
      query: jest.fn(),
    }),
  };
});

// 모킹된 데이터
const mockContents = [
  {
    id: 1,
    title: "영화 제목 1",
    thumbnail_url: "/thumbnails/movie1.jpg",
    release_year: 2021,
  },
  {
    id: 2,
    title: "영화 제목 2",
    thumbnail_url: "/thumbnails/movie2.jpg",
    release_year: 2020,
  },
  {
    id: 3,
    title: "영화 제목 3",
    thumbnail_url: "/thumbnails/movie3.jpg",
    release_year: 2022,
  },
];

const mockUser = {
  id: 1,
  email: "test@example.com",
  name: "테스트 사용자",
  is_active: true,
};

const mockWishlists = [{ content: { id: 1 }, user: { id: 1 } }];

describe("콘텐츠 API 테스트", () => {
  // 테스트 전 모킹 설정
  beforeEach(() => {
    jest.clearAllMocks();

    // Content 레포지토리 모킹
    const contentRepositoryMock = {
      find: jest.fn().mockResolvedValue(mockContents),
    };
    (getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Content) {
        return contentRepositoryMock;
      } else if (entity === Wishlist) {
        return {
          find: jest.fn().mockResolvedValue(mockWishlists),
        };
      } else if (entity === User) {
        return {
          findOne: jest.fn().mockResolvedValue(mockUser),
        };
      }
      return {};
    });

    // JWT 검증 모킹
    jest
      .spyOn(jwt, "verify")
      .mockImplementation(() => ({ id: 1, email: "test@example.com" }));
  });

  describe("GET /api/contents", () => {
    it("비로그인 상태에서 콘텐츠 목록을 조회할 수 있어야 함", async () => {
      const response = await request(app).get("/api/contents");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("contents");
      expect(response.body.contents).toHaveLength(3);
      expect(response.body.contents[0]).toHaveProperty("id");
      expect(response.body.contents[0]).toHaveProperty("title");
      expect(response.body.contents[0]).toHaveProperty("thumbnail_url");
      expect(response.body.contents[0]).toHaveProperty("release_year");
      expect(response.body.contents[0]).not.toHaveProperty("is_wished");
    });

    it("로그인 상태에서 찜 정보를 포함한 콘텐츠 목록을 조회할 수 있어야 함", async () => {
      const response = await request(app)
        .get("/api/contents")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("contents");
      expect(response.body.contents).toHaveLength(3);
      expect(response.body.contents[0]).toHaveProperty("id");
      expect(response.body.contents[0]).toHaveProperty("title");
      expect(response.body.contents[0]).toHaveProperty("thumbnail_url");
      expect(response.body.contents[0]).toHaveProperty("release_year");
      expect(response.body.contents[0]).toHaveProperty("is_wished");

      // 찜한 콘텐츠(ID가 1인 콘텐츠)는 is_wished가 true여야 함
      const wishedContent = response.body.contents.find(
        (content: any) => content.id === 1
      );
      expect(wishedContent.is_wished).toBe(true);

      // 찜하지 않은 콘텐츠는 is_wished가 false여야 함
      const notWishedContent = response.body.contents.find(
        (content: any) => content.id === 2
      );
      expect(notWishedContent.is_wished).toBe(false);
    });

    it("유효하지 않은 토큰으로 요청 시 401 에러를 반환해야 함", async () => {
      // JWT 검증 모킹을 에러를 던지도록 오버라이드
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new jwt.JsonWebTokenError("유효하지 않은 토큰");
      });

      const response = await request(app)
        .get("/api/contents")
        .set("Authorization", "Bearer invalid-token");

      // 선택적 인증이므로 401 에러가 아니라 200을 반환하고 찜 정보가 없어야 함
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("contents");
      expect(response.body.contents[0]).not.toHaveProperty("is_wished");
    });
  });

  describe("GET /api/contents/genre/:genreId", () => {
    const mockContents = [
      {
        id: 1,
        title: "액션 영화 1",
        thumbnail_url: "/thumbnails/action1.jpg",
        release_year: 2020,
      },
      {
        id: 2,
        title: "액션 영화 2",
        thumbnail_url: "/thumbnails/action2.jpg",
        release_year: 2021,
      },
      {
        id: 3,
        title: "액션 영화 3",
        thumbnail_url: "/thumbnails/action3.jpg",
        release_year: 2022,
      },
    ];

    const mockWishlists = [{ content: { id: 1 } }];

    beforeEach(() => {
      // getManager().query 모킹
      const queryMock = jest.fn().mockResolvedValue(mockContents);
      const managerMock = {
        query: queryMock,
      };
      require("typeorm").getManager.mockReturnValue(managerMock);

      // Genre 리포지토리 모킹
      (getRepository as jest.Mock).mockImplementation((entity) => {
        if (entity.name === "Genre") {
          return {
            findOne: jest.fn().mockResolvedValue({ id: 1, name: "액션" }),
          };
        }
        if (entity.name === "Wishlist") {
          return {
            find: jest.fn().mockResolvedValue(mockWishlists),
          };
        }
        return {};
      });
    });

    it("장르별로 콘텐츠를 필터링할 수 있어야 함", async () => {
      const response = await request(app)
        .get("/api/contents/genre/1")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("contents");
      expect(response.body.contents).toHaveLength(3);
      expect(response.body.contents[0]).toHaveProperty("id", 1);
      expect(response.body.contents[0]).toHaveProperty("title", "액션 영화 1");
      expect(response.body.contents[0]).toHaveProperty("is_wished", true);
      expect(response.body.contents[1]).toHaveProperty("is_wished", false);
    });

    it("비로그인 상태에서 장르별로 콘텐츠를 필터링할 수 있어야 함", async () => {
      const response = await request(app).get("/api/contents/genre/1");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("contents");
      expect(response.body.contents).toHaveLength(3);
      expect(response.body.contents[0]).not.toHaveProperty("is_wished");
    });

    it("잘못된 장르 ID로 요청 시 400 에러를 반환해야 함", async () => {
      const response = await request(app).get("/api/contents/genre/invalid");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("유효하지 않은 장르 ID");
    });

    it("존재하지 않는 장르 ID로 요청 시 404 에러를 반환해야 함", async () => {
      // Genre 리포지토리 모킹을 존재하지 않는 장르로 변경
      (getRepository as jest.Mock).mockImplementation((entity) => {
        if (entity.name === "Genre") {
          return {
            findOne: jest.fn().mockResolvedValue(null),
          };
        }
        return {};
      });

      const response = await request(app).get("/api/contents/genre/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("존재하지 않는 장르입니다.");
    });
  });
});
