import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { Content, WishlistResponseDTO } from "../models/Content";
import {
  LoginResponse,
  User,
  UserCreationAttributes,
  UserLoginDTO,
  UserResponse,
} from "../models/User";
import { Wishlist } from "../models/Wishlist";
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from "../utils/errors";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private wishlistRepository = AppDataSource.getRepository(Wishlist);
  private contentRepository = AppDataSource.getRepository(Content);

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

  /**
   * 사용자의 계정 정보를 조회합니다.
   *
   * @param userId 사용자 ID
   * @returns 사용자 정보 객체
   */
  async getUserInfo(userId: number): Promise<UserResponse> {
    // 사용자 조회
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    // 사용자가 존재하지 않는 경우
    if (!user) {
      throw new UnauthorizedError("존재하지 않는 사용자입니다.");
    }

    // 계정이 비활성화된 경우
    if (!user.is_active) {
      throw new ForbiddenError("비활성화된 계정입니다.");
    }

    // 응답 데이터 생성
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      is_active: user.is_active,
    };

    return userResponse;
  }

  /**
   * 사용자의 찜 목록을 조회합니다.
   *
   * @param userId 사용자 ID
   * @returns 찜한 콘텐츠 정보 배열
   */
  async fetchWishlist(userId: number): Promise<WishlistResponseDTO[]> {
    // 사용자가 존재하는지 확인
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError("존재하지 않는 사용자입니다.");
    }

    // 해당 사용자의 찜 목록 조회
    const wishlists = await this.wishlistRepository.find({
      where: { user: { id: userId } },
      relations: ["content"],
    });

    // 콘텐츠 정보만 추출하여 반환
    return wishlists.map((wishlist) => {
      const content = wishlist.content;
      return {
        id: content.id,
        title: content.title,
        thumbnail_url: content.thumbnail_url,
        release_year: content.release_year,
      };
    });
  }
}
