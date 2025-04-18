import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Content } from "./Content";
import { User } from "./User";

@Entity("wishlists")
export class Wishlist {
  @PrimaryGeneratedColumn({ type: "bigint", comment: "찜 목록 고유 식별자" })
  id!: number;

  @ManyToOne(() => User, (user) => user.wishlists, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Content, (content) => content.wishlists, {
    onDelete: "CASCADE",
  })
  content!: Content;

  @CreateDateColumn({ comment: "찜한 일시" })
  created_at!: Date;
}
