import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Content } from "./Content";
import { Genre } from "./Genre";

@Entity("content_genres")
export class ContentGenre {
  @PrimaryGeneratedColumn({ type: "bigint", comment: "매핑 고유 식별자" })
  id!: number;

  @ManyToOne(() => Content, (content) => content.contentGenres, {
    onDelete: "CASCADE",
  })
  content!: Content;

  @ManyToOne(() => Genre, (genre) => genre.contentGenres, {
    onDelete: "CASCADE",
  })
  genre!: Genre;
}
