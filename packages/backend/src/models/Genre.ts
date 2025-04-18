import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ContentGenre } from "./ContentGenre";

@Entity("genres")
export class Genre {
  @PrimaryGeneratedColumn({ type: "bigint", comment: "장르 고유 식별자" })
  id!: number;

  @Column({ type: "varchar", length: 50, unique: true, comment: "장르명" })
  name!: string;

  @Column({
    type: "varchar",
    length: 200,
    nullable: true,
    comment: "장르 설명",
  })
  description!: string;

  @OneToMany(() => ContentGenre, (contentGenre) => contentGenre.genre)
  contentGenres!: ContentGenre[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     GenreResponseDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 장르 고유 식별자
 *         name:
 *           type: string
 *           description: 장르명
 *         description:
 *           type: string
 *           description: 장르 설명
 */
export interface GenreResponseDTO {
  id: number;
  name: string;
  description?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     GenreListResponse:
 *       type: object
 *       properties:
 *         genres:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GenreResponseDTO'
 */
export interface GenreListResponse {
  genres: GenreResponseDTO[];
}
