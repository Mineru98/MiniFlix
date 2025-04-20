import { Genre } from "@/infrastructure/api/genre/dtos";

export interface RelatedContentByGenreProps {
  genres: Genre[];
  currentContentId: number;
}
