import { getRepository } from "typeorm";
import { Genre, GenreResponseDTO } from "../models/Genre";

export class GenreService {
  /**
   * 모든 장르 목록을 조회합니다.
   *
   * @returns 장르 목록
   */
  async getAllGenres(): Promise<GenreResponseDTO[]> {
    const genreRepository = getRepository(Genre);

    // 모든 장르 조회
    const genres = await genreRepository.find({
      select: ["id", "name", "description"],
    });

    // DTO 형태로 변환하여 반환
    return genres.map((genre) => ({
      id: genre.id,
      name: genre.name,
      description: genre.description,
    }));
  }
}
