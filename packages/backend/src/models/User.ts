import { IsEmail, IsString, MinLength } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ViewingHistory } from "./ViewingHistory";
import { Wishlist } from "./Wishlist";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - password_hash
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: 사용자 고유 식별자
 *         email:
 *           type: string
 *           format: email
 *           description: 사용자 이메일(로그인 ID)
 *         password_hash:
 *           type: string
 *           description: 암호화된 비밀번호
 *         name:
 *           type: string
 *           description: 사용자 이름
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 가입일시
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 정보 수정일시
 *         is_active:
 *           type: boolean
 *           description: 계정 활성화 상태
 */
@Entity("users")
export class User {
  @PrimaryGeneratedColumn({ type: "bigint", comment: "사용자 고유 식별자" })
  id!: number;

  @Column({
    type: "varchar",
    length: 100,
    unique: true,
    comment: "사용자 이메일(로그인 ID)",
  })
  @IsEmail()
  email!: string;

  @Column({ type: "varchar", length: 255, comment: "암호화된 비밀번호" })
  @IsString()
  @MinLength(8)
  password_hash!: string;

  @Column({ type: "varchar", length: 50, comment: "사용자 이름" })
  @IsString()
  name!: string;

  @CreateDateColumn({ comment: "가입일시" })
  created_at!: Date;

  @UpdateDateColumn({ comment: "정보 수정일시" })
  updated_at!: Date;

  @Column({ type: "boolean", default: true, comment: "계정 활성화 상태" })
  is_active!: boolean;

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  wishlists!: Wishlist[];

  @OneToMany(() => ViewingHistory, (viewingHistory) => viewingHistory.user)
  viewingHistories!: ViewingHistory[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserCreationAttributes:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: 사용자 이메일
 *         password:
 *           type: string
 *           format: password
 *           description: 비밀번호(최소 8자 이상)
 *         name:
 *           type: string
 *           description: 사용자 이름
 */
export interface UserCreationAttributes {
  email: string;
  password: string;
  name: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 사용자 고유 식별자
 *         email:
 *           type: string
 *           format: email
 *           description: 사용자 이메일
 *         name:
 *           type: string
 *           description: 사용자 이름
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 가입일시
 *         is_active:
 *           type: boolean
 *           description: 계정 활성화 상태
 */
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  created_at: Date;
  is_active: boolean;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserLoginDTO:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: 사용자 이메일
 *         password:
 *           type: string
 *           format: password
 *           description: 비밀번호
 */
export interface UserLoginDTO {
  email: string;
  password: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT 인증 토큰
 *         user:
 *           $ref: '#/components/schemas/UserResponse'
 */
export interface LoginResponse {
  token: string;
  user: UserResponse;
}
