import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import {
  LoginResponse,
  User,
  UserCreationAttributes,
  UserLoginDTO,
  UserResponse,
} from "../models/User";
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from "../utils/errors";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async createUser(userData: UserCreationAttributes): Promise<UserResponse> {
    // 이메일 중복 확인
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictError("이미 사용 중인 이메일입니다.");
    }

    // 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // 새 사용자 생성
    const newUser = this.userRepository.create({
      email: userData.email,
      password_hash: hashedPassword,
      name: userData.name,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // DB에 저장
    const savedUser = await this.userRepository.save(newUser);

    // 응답 데이터 생성
    const userResponse: UserResponse = {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      created_at: savedUser.created_at,
      is_active: savedUser.is_active,
    };

    return userResponse;
  }

  async login(loginData: UserLoginDTO): Promise<LoginResponse> {
    // 이메일로 사용자 조회
    const user = await this.userRepository.findOne({
      where: { email: loginData.email },
    });

    // 사용자가 존재하지 않는 경우
    if (!user) {
      throw new UnauthorizedError("존재하지 않는 사용자입니다.");
    }

    // 계정이 비활성화된 경우
    if (!user.is_active) {
      throw new ForbiddenError("비활성화된 계정입니다.");
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password_hash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("비밀번호가 일치하지 않습니다.");
    }

    // JWT 토큰 생성
    const tokenSecret = process.env.JWT_SECRET || "miniflix-secret-key";
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      tokenSecret,
      { expiresIn: "24h" }
    );

    // 응답 데이터 생성
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      is_active: user.is_active,
    };

    return {
      token,
      user: userResponse,
    };
  }
}
