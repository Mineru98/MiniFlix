import jwt from "jsonwebtoken";
import request from "supertest";
import { getRepository, Repository } from "typeorm";
import app from "../../index";
import { Content } from "../../models/Content";
import { User } from "../../models/User";
import { ViewingHistory } from "../../models/ViewingHistory";

describe("콘텐츠 재생 API 통합 테스트", () => {
  let userRepository: Repository<User>;
  let contentRepository: Repository<Content>;
  let viewingHistoryRepository: Repository<ViewingHistory>;
  let testUser: User;
  let testContent: Content;
  let authToken: string;

  beforeAll(async () => {
    userRepository = getRepository(User);
    contentRepository = getRepository(Content);
    viewingHistoryRepository = getRepository(ViewingHistory);

    // 테스트 사용자 생성
    testUser = await userRepository.save({
      email: "test@example.com",
      password_hash: "hashed_password",
      name: "Test User",
      is_active: true,
    });

    // 테스트 콘텐츠 생성
    testContent = await contentRepository.save({
      title: "테스트 영화",
      description: "테스트용 영화입니다.",
      thumbnail_url: "/images/test.jpg",
      video_url: "/videos/test.mp4",
      duration: 3600, // 1시간
      release_year: 2023,
    });

    // JWT 토큰 생성
    const jwtSecret = process.env.JWT_SECRET || "test_secret";
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      jwtSecret,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await viewingHistoryRepository.delete({ user: { id: testUser.id } });
    await contentRepository.delete(testContent.id);
    await userRepository.delete(testUser.id);
  });

  describe("GET /api/contents/:id/stream", () => {
    it("로그인한 사용자는 콘텐츠 스트리밍 정보를 조회할 수 있다", async () => {
      const response = await request(app)
        .get(`/api/contents/${testContent.id}/stream`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "streaming_url",
        testContent.video_url
      );
      expect(response.body).toHaveProperty("last_position");
    });

    it("로그인하지 않은 사용자는 콘텐츠 스트리밍 정보를 조회할 수 없다", async () => {
      const response = await request(app).get(
        `/api/contents/${testContent.id}/stream`
      );

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/contents/playback/position", () => {
    it("로그인한 사용자는 재생 위치를 업데이트할 수 있다", async () => {
      const response = await request(app)
        .post("/api/contents/playback/position")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content_id: testContent.id,
          current_position: 300,
        });

      expect(response.status).toBe(200);

      // 데이터베이스에서 업데이트된 시청 기록 확인
      const viewingHistory = await viewingHistoryRepository.findOne({
        where: {
          user: { id: testUser.id },
          content: { id: testContent.id },
        },
      });

      expect(viewingHistory).toBeDefined();
      expect(viewingHistory?.last_position).toBe(300);
    });

    it("로그인하지 않은 사용자는 재생 위치를 업데이트할 수 없다", async () => {
      const response = await request(app)
        .post("/api/contents/playback/position")
        .send({
          content_id: testContent.id,
          current_position: 300,
        });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/contents/playback/final", () => {
    it("로그인한 사용자는 최종 재생 정보를 업데이트할 수 있다", async () => {
      const response = await request(app)
        .post("/api/contents/playback/final")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content_id: testContent.id,
          final_position: 1800,
          watch_duration: 1850,
          is_completed: true,
        });

      expect(response.status).toBe(200);

      // 데이터베이스에서 업데이트된 시청 기록 확인
      const viewingHistory = await viewingHistoryRepository.findOne({
        where: {
          user: { id: testUser.id },
          content: { id: testContent.id },
        },
      });

      expect(viewingHistory).toBeDefined();
      expect(viewingHistory?.last_position).toBe(1800);
      expect(viewingHistory?.watch_duration).toBe(1850);
      expect(viewingHistory?.is_completed).toBe(true);
    });

    it("로그인하지 않은 사용자는 최종 재생 정보를 업데이트할 수 없다", async () => {
      const response = await request(app)
        .post("/api/contents/playback/final")
        .send({
          content_id: testContent.id,
          final_position: 1800,
          watch_duration: 1850,
          is_completed: true,
        });

      expect(response.status).toBe(401);
    });
  });
});
