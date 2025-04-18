import jwt from "jsonwebtoken";
import request from "supertest";
import { createConnection, getConnection, getRepository } from "typeorm";
import app from "../index";
import { Content } from "../models/Content";
import { User } from "../models/User";
import { Wishlist } from "../models/Wishlist";

describe("콘텐츠 검색 API", () => {
  let token: string;
  let user: User;

  beforeAll(async () => {
    await createConnection();

    // 테스트 사용자 생성
    const userRepository = getRepository(User);
    user = userRepository.create({
      email: "test@miniflix.com",
      password_hash: await require("bcrypt").hash("password123", 10),
      name: "테스트 사용자",
      is_active: true,
    });
    await userRepository.save(user);

    // JWT 토큰 생성
    token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1h" }
    );

    // 테스트 콘텐츠 데이터 생성
    const contentRepository = getRepository(Content);

    // 콘텐츠 1: 액션 영화
    await contentRepository.save(
      contentRepository.create({
        title: "액션 영화 테스트",
        description: "테스트용 액션 영화입니다.",
        thumbnail_url: "/thumbnails/action.jpg",
        video_url: "/videos/action.mp4",
        duration: 7200,
        release_year: 2022,
      })
    );

    // 콘텐츠 2: 로맨스 영화
    await contentRepository.save(
      contentRepository.create({
        title: "로맨스 영화 테스트",
        description: "테스트용 로맨스 영화입니다.",
        thumbnail_url: "/thumbnails/romance.jpg",
        video_url: "/videos/romance.mp4",
        duration: 6000,
        release_year: 2023,
      })
    );

    // 콘텐츠 3: 다른 이름의 영화
    await contentRepository.save(
      contentRepository.create({
        title: "전혀 다른 영화",
        description: "테스트와 관련 없는 영화입니다.",
        thumbnail_url: "/thumbnails/other.jpg",
        video_url: "/videos/other.mp4",
        duration: 5400,
        release_year: 2021,
      })
    );

    // 찜 목록 생성 (첫 번째 콘텐츠만 찜함)
    const wishlistRepository = getRepository(Wishlist);
    const contents = await contentRepository.find();

    await wishlistRepository.save(
      wishlistRepository.create({
        user,
        content: contents[0],
      })
    );
  });

  afterAll(async () => {
    const connection = getConnection();
    await connection.close();
  });

  it("비로그인 상태에서 검색하면 찜 정보가 없는 결과를 반환해야 함", async () => {
    const response = await request(app)
      .get("/api/contents/search")
      .query({ q: "테스트" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("contents");
    expect(response.body.contents).toBeInstanceOf(Array);
    expect(response.body.contents.length).toBe(2); // "테스트"가 포함된 콘텐츠 2개

    // 각 콘텐츠에 is_wished 속성이 없어야 함
    response.body.contents.forEach((content: any) => {
      expect(content).toHaveProperty("id");
      expect(content).toHaveProperty("title");
      expect(content).toHaveProperty("thumbnail_url");
      expect(content).toHaveProperty("release_year");
      expect(content).not.toHaveProperty("is_wished");
    });
  });

  it("로그인 상태에서 검색하면 찜 정보가 포함된 결과를 반환해야 함", async () => {
    const response = await request(app)
      .get("/api/contents/search")
      .query({ q: "테스트" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("contents");
    expect(response.body.contents).toBeInstanceOf(Array);
    expect(response.body.contents.length).toBe(2); // "테스트"가 포함된 콘텐츠 2개

    // 각 콘텐츠에 is_wished 속성이 있어야 함
    response.body.contents.forEach((content: any) => {
      expect(content).toHaveProperty("id");
      expect(content).toHaveProperty("title");
      expect(content).toHaveProperty("thumbnail_url");
      expect(content).toHaveProperty("release_year");
      expect(content).toHaveProperty("is_wished");
    });

    // 첫 번째 콘텐츠는 찜한 상태여야 함
    const actionMovie = response.body.contents.find(
      (content: any) => content.title === "액션 영화 테스트"
    );
    expect(actionMovie).toBeDefined();
    expect(actionMovie.is_wished).toBe(true);

    // 두 번째 콘텐츠는 찜하지 않은 상태여야 함
    const romanceMovie = response.body.contents.find(
      (content: any) => content.title === "로맨스 영화 테스트"
    );
    expect(romanceMovie).toBeDefined();
    expect(romanceMovie.is_wished).toBe(false);
  });

  it("검색어가 없으면 400 오류를 반환해야 함", async () => {
    const response = await request(app)
      .get("/api/contents/search")
      .query({ q: "" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("검색어를 입력해주세요.");
  });

  it("검색 결과가 없으면 빈 배열을 반환해야 함", async () => {
    const response = await request(app)
      .get("/api/contents/search")
      .query({ q: "존재하지않는내용" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("contents");
    expect(response.body.contents).toBeInstanceOf(Array);
    expect(response.body.contents.length).toBe(0);
  });
});
