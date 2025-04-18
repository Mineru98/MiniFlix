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

export interface UserCreationAttributes {
  email: string;
  password: string;
  name: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  created_at: Date;
  is_active: boolean;
}

export interface UserLoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}
