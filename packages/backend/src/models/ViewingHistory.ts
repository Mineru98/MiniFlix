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

/**
 * @swagger
 * components:
 *   schemas:
 *     StreamingInfoResponse:
 *       type: object
 *       properties:
 *         streaming_url:
 *           type: string
 *           description: 비디오 스트리밍 URL
 *         last_position:
 *           type: integer
 *           description: 마지막 시청 위치(초)
 */
export interface StreamingInfoResponse {
  streaming_url: string;
  last_position: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     PlaybackPositionUpdateDTO:
 *       type: object
 *       required:
 *         - content_id
 *         - current_position
 *       properties:
 *         content_id:
 *           type: integer
 *           description: 콘텐츠 ID
 *         current_position:
 *           type: integer
 *           description: 현재 재생 위치(초)
 */
export interface PlaybackPositionUpdateDTO {
  content_id: number;
  current_position: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     PlaybackFinalUpdateDTO:
 *       type: object
 *       required:
 *         - content_id
 *         - final_position
 *         - watch_duration
 *       properties:
 *         content_id:
 *           type: integer
 *           description: 콘텐츠 ID
 *         final_position:
 *           type: integer
 *           description: 최종 재생 위치(초)
 *         watch_duration:
 *           type: integer
 *           description: 시청 시간(초)
 *         is_completed:
 *           type: boolean
 *           description: 시청 완료 여부
 */
export interface PlaybackFinalUpdateDTO {
  content_id: number;
  final_position: number;
  watch_duration: number;
  is_completed: boolean;
}
