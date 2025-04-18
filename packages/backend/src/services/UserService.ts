import bcrypt from "bcrypt";
import { AppDataSource } from "../config/database";
import { User, UserCreationAttributes, UserResponse } from "../models/User";
import { ConflictError } from "../utils/errors";

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
}
