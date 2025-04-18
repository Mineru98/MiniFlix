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

/**
 * @swagger
 * components:
 *   schemas:
 *     ContentListResponseDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 콘텐츠 고유 식별자
 *         title:
 *           type: string
 *           description: 콘텐츠 제목
 *         thumbnail_url:
 *           type: string
 *           description: 썸네일 이미지 경로
 *         release_year:
 *           type: integer
 *           description: 출시 연도
 *         is_wished:
 *           type: boolean
 *           description: 사용자가 찜한 콘텐츠인지 여부 (로그인 상태인 경우에만 포함)
 */
export interface ContentListResponseDTO {
  id: number;
  title: string;
  thumbnail_url: string;
  release_year: number;
  is_wished?: boolean;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ContentListResponse:
 *       type: object
 *       properties:
 *         contents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentListResponseDTO'
 */
export interface ContentListResponse {
  contents: ContentListResponseDTO[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ContentSearchResponseDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 콘텐츠 고유 식별자
 *         title:
 *           type: string
 *           description: 콘텐츠 제목
 *         thumbnail_url:
 *           type: string
 *           description: 썸네일 이미지 경로
 *         release_year:
 *           type: integer
 *           description: 출시 연도
 *         is_wished:
 *           type: boolean
 *           description: 사용자가 찜한 콘텐츠인지 여부 (로그인 상태인 경우에만 포함)
 */
export interface ContentSearchResponseDTO {
  id: number;
  title: string;
  thumbnail_url: string;
  release_year: number;
  is_wished?: boolean;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ContentSearchResponse:
 *       type: object
 *       properties:
 *         contents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentSearchResponseDTO'
 */
export interface ContentSearchResponse {
  contents: ContentSearchResponseDTO[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ContentDetailResponseDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 콘텐츠 고유 식별자
 *         title:
 *           type: string
 *           description: 콘텐츠 제목
 *         description:
 *           type: string
 *           description: 콘텐츠 설명
 *         thumbnail_url:
 *           type: string
 *           description: 썸네일 이미지 경로
 *         video_url:
 *           type: string
 *           description: 비디오 파일 경로
 *         duration:
 *           type: integer
 *           description: 영상 길이(초)
 *         release_year:
 *           type: integer
 *           description: 출시 연도
 *         genres:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GenreResponseDTO'
 *           description: 콘텐츠 장르 목록
 *         is_wished:
 *           type: boolean
 *           description: 사용자가 찜한 콘텐츠인지 여부 (로그인 상태인 경우에만 포함)
 *         last_position:
 *           type: integer
 *           description: 마지막 시청 위치(초) (로그인 상태인 경우에만 포함)
 */
export interface ContentDetailResponseDTO {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: number;
  release_year: number;
  genres: {
    id: number;
    name: string;
    description?: string;
  }[];
  is_wished?: boolean;
  last_position?: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ContentDetailResponse:
 *       type: object
 *       properties:
 *         content:
 *           $ref: '#/components/schemas/ContentDetailResponseDTO'
 */
export interface ContentDetailResponse {
  content: ContentDetailResponseDTO;
}
