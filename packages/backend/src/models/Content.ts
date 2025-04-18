import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ContentGenre } from "./ContentGenre";
import { ViewingHistory } from "./ViewingHistory";
import { Wishlist } from "./Wishlist";

@Entity("contents")
export class Content {
  @PrimaryGeneratedColumn({ type: "bigint", comment: "콘텐츠 고유 식별자" })
  id!: number;

  @Column({ type: "varchar", length: 200, comment: "콘텐츠 제목" })
  title!: string;

  @Column({ type: "text", comment: "콘텐츠 설명" })
  description!: string;

  @Column({ type: "varchar", length: 255, comment: "썸네일 이미지 경로" })
  thumbnail_url!: string;

  @Column({ type: "varchar", length: 255, comment: "비디오 파일 경로" })
  video_url!: string;

  @Column({ type: "int", comment: "영상 길이(초)" })
  duration!: number;

  @Column({ type: "int", comment: "출시 연도" })
  release_year!: number;

  @CreateDateColumn({ comment: "등록일시" })
  created_at!: Date;

  @UpdateDateColumn({ comment: "수정일시" })
  updated_at!: Date;

  @OneToMany(() => ContentGenre, (contentGenre) => contentGenre.content)
  contentGenres!: ContentGenre[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.content)
  wishlists!: Wishlist[];

  @OneToMany(() => ViewingHistory, (viewingHistory) => viewingHistory.content)
  viewingHistories!: ViewingHistory[];
}
