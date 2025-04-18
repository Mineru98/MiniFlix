import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Content } from "./Content";
import { User } from "./User";

@Entity("viewing_histories")
export class ViewingHistory {
  @PrimaryGeneratedColumn({ type: "bigint", comment: "시청 기록 고유 식별자" })
  id!: number;

  @ManyToOne(() => User, (user) => user.viewingHistories, {
    onDelete: "CASCADE",
  })
  user!: User;

  @ManyToOne(() => Content, (content) => content.viewingHistories, {
    onDelete: "CASCADE",
  })
  content!: Content;

  @Column({ type: "int", default: 0, comment: "시청 시간(초)" })
  watch_duration!: number;

  @Column({ type: "int", default: 0, comment: "마지막 시청 위치(초)" })
  last_position!: number;

  @UpdateDateColumn({ comment: "시청 일시" })
  watched_at!: Date;

  @Column({ type: "boolean", default: false, comment: "시청 완료 여부" })
  is_completed!: boolean;
}
