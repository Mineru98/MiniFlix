import { Request, Response } from "express";
import { GenreListResponse } from "../models/Genre";
import { GenreService } from "../services/GenreService";

export class GenreController {
  private genreService: GenreService;

  constructor() {
    this.genreService = new GenreService();
  }

  /**
   * @swagger
   * /api/genres:
   *   get:
   *     summary: 모든 장르 목록을 조회합니다.
   *     description: 장르 필터링을 위한 장르 목록을 조회합니다.
   *     tags: [Genres]
   *     responses:
   *       200:
   *         description: 장르 목록 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenreListResponse'
   *       500:
   *         description: 서버 에러
   */
  async getGenres(req: Request, res: Response): Promise<void> {
    try {
      const genres = await this.genreService.getAllGenres();

      const response: GenreListResponse = {
        genres,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("장르 목록 조회 실패:", error);
      res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
  }
}
