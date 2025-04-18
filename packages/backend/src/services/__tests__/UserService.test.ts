import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../config/database";
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from "../../utils/errors";
import { UserService } from "../UserService";

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    // AppDataSource.getRepository 모킹
    jest
      .spyOn(AppDataSource, "getRepository")
      .mockReturnValue(mockUserRepository);

    userService = new UserService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    const mockUserData = {
      email: "test@example.com",
      password: "password123",
      name: "홍길동",
    };

    it("새로운 사용자를 성공적으로 생성해야 함", async () => {
      // 이메일 중복 체크 모킹
      mockUserRepository.findOne.mockResolvedValue(null);

      // 비밀번호 해싱 모킹
      const hashedPassword = "hashed_password";
      jest.spyOn(bcrypt, "hash").mockResolvedValue(hashedPassword as never);

      // 사용자 생성 모킹
      const mockCreatedUser = {
        id: 1,
        email: mockUserData.email,
        password_hash: hashedPassword,
        name: mockUserData.name,
        created_at: new Date(),
        is_active: true,
      };

      mockUserRepository.create.mockReturnValue(mockCreatedUser);
      mockUserRepository.save.mockResolvedValue(mockCreatedUser);

      // 테스트 실행
      const result = await userService.createUser(mockUserData);

      // 검증
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUserData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockCreatedUser.id,
        email: mockCreatedUser.email,
        name: mockCreatedUser.name,
        created_at: mockCreatedUser.created_at,
        is_active: mockCreatedUser.is_active,
      });
    });

    it("이미 존재하는 이메일로 가입 시도 시 ConflictError를 발생시켜야 함", async () => {
      // 이미 존재하는 사용자 모킹
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        email: mockUserData.email,
      });

      // 테스트 실행 및 검증
      await expect(userService.createUser(mockUserData)).rejects.toThrow(
        ConflictError
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUserData.email },
      });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    const mockLoginData = {
      email: "test@example.com",
      password: "password123",
    };

    const mockUser = {
      id: 1,
      email: "test@example.com",
      password_hash: "hashed_password",
      name: "홍길동",
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
    };

    it("올바른 사용자 인증 정보로 로그인 시 토큰과 사용자 정보를 반환해야 함", async () => {
      // 사용자 조회 모킹
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // 비밀번호 검증 모킹
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

      // JWT 토큰 생성 모킹
      const mockToken = "mock_jwt_token";
      jest.spyOn(jwt, "sign").mockReturnValue(mockToken as never);

      // 테스트 실행
      const result = await userService.login(mockLoginData);

      // 검증
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockLoginData.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginData.password,
        mockUser.password_hash
      );
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          created_at: mockUser.created_at,
          is_active: mockUser.is_active,
        },
      });
    });

    it("존재하지 않는 사용자로 로그인 시 UnauthorizedError를 발생시켜야 함", async () => {
      // 사용자가 없는 경우 모킹
      mockUserRepository.findOne.mockResolvedValue(null);

      // 테스트 실행 및 검증
      await expect(userService.login(mockLoginData)).rejects.toThrow(
        UnauthorizedError
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockLoginData.email },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("비활성화된 계정으로 로그인 시 ForbiddenError를 발생시켜야 함", async () => {
      // 비활성화된 사용자 모킹
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        is_active: false,
      });

      // 테스트 실행 및 검증
      await expect(userService.login(mockLoginData)).rejects.toThrow(
        ForbiddenError
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockLoginData.email },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("잘못된 비밀번호로 로그인 시 UnauthorizedError를 발생시켜야 함", async () => {
      // 사용자 조회 모킹
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // 비밀번호 검증 실패 모킹
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      // 테스트 실행 및 검증
      await expect(userService.login(mockLoginData)).rejects.toThrow(
        UnauthorizedError
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockLoginData.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginData.password,
        mockUser.password_hash
      );
    });
  });
});
