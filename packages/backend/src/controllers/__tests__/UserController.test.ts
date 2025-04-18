import bcrypt from "bcrypt";
import request from "supertest";
import { app } from "../../app";
import { AppDataSource } from "../../config/database";
import { User } from "../../models/User";

describe("UserController (통합 테스트)", () => {
  let connection: any;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  beforeEach(async () => {
    // 테스트 전 사용자 테이블 초기화
    await connection.getRepository(User).clear();
  });

  describe("POST /users", () => {
    const validUserData = {
      email: "test@example.com",
      password: "password123",
      name: "홍길동",
    };

    it("유효한 데이터로 회원가입 시 201 상태코드와 사용자 정보를 반환해야 함", async () => {
      const response = await request(app)
        .post("/users")
        .send(validUserData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe(validUserData.email);
      expect(response.body.name).toBe(validUserData.name);
      expect(response.body).toHaveProperty("created_at");
      expect(response.body.is_active).toBe(true);
      expect(response.body).not.toHaveProperty("password");
      expect(response.body).not.toHaveProperty("password_hash");
    });

    it("이미 존재하는 이메일로 회원가입 시 409 상태코드를 반환해야 함", async () => {
      // 첫 번째 회원가입
      await request(app).post("/users").send(validUserData);

      // 동일한 이메일로 두 번째 회원가입 시도
      const response = await request(app)
        .post("/users")
        .send(validUserData)
        .expect(409);

      expect(response.body).toHaveProperty(
        "message",
        "이미 사용 중인 이메일입니다."
      );
    });

    it("유효하지 않은 이메일로 회원가입 시 400 상태코드를 반환해야 함", async () => {
      const invalidUserData = {
        ...validUserData,
        email: "invalid-email",
      };

      const response = await request(app)
        .post("/users")
        .send(invalidUserData)
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("비밀번호가 너무 짧을 경우 400 상태코드를 반환해야 함", async () => {
      const invalidUserData = {
        ...validUserData,
        password: "123",
      };

      const response = await request(app)
        .post("/users")
        .send(invalidUserData)
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("필수 필드가 누락된 경우 400 상태코드를 반환해야 함", async () => {
      const invalidUserData = {
        email: validUserData.email,
        // password와 name 누락
      };

      const response = await request(app)
        .post("/users")
        .send(invalidUserData)
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /users/login", () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      name: "홍길동",
    };

    beforeEach(async () => {
      // 테스트 사용자 생성 (회원가입)
      const userRepository = connection.getRepository(User);
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const user = userRepository.create({
        email: userData.email,
        password_hash: hashedPassword,
        name: userData.name,
        is_active: true,
      });

      await userRepository.save(user);
    });

    it("올바른 인증 정보로 로그인 시 토큰과 사용자 정보를 반환해야 함", async () => {
      const loginData = {
        email: userData.email,
        password: userData.password,
      };

      const response = await request(app)
        .post("/users/login")
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).not.toHaveProperty("password");
      expect(response.body.user).not.toHaveProperty("password_hash");
    });

    it("존재하지 않는 이메일로 로그인 시 401 상태코드를 반환해야 함", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: userData.password,
      };

      const response = await request(app)
        .post("/users/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty(
        "message",
        "존재하지 않는 사용자입니다."
      );
    });

    it("잘못된 비밀번호로 로그인 시 401 상태코드를 반환해야 함", async () => {
      const loginData = {
        email: userData.email,
        password: "wrong_password",
      };

      const response = await request(app)
        .post("/users/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty(
        "message",
        "비밀번호가 일치하지 않습니다."
      );
    });

    it("비활성화된 계정으로 로그인 시 403 상태코드를 반환해야 함", async () => {
      // 사용자 계정 비활성화
      const userRepository = connection.getRepository(User);
      await userRepository.update(
        { email: userData.email },
        { is_active: false }
      );

      const loginData = {
        email: userData.email,
        password: userData.password,
      };

      const response = await request(app)
        .post("/users/login")
        .send(loginData)
        .expect(403);

      expect(response.body).toHaveProperty("message", "비활성화된 계정입니다.");
    });
  });
});
