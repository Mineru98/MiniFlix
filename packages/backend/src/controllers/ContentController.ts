import { Request, Response } from "express";
import { ContentListResponse } from "../models/Content";
import { ContentService } from "../services/ContentService";

export class ContentController {
  private contentService: ContentService;

  constructor() {
    this.contentService = new ContentService();
  }

  /**
   * @swagger
   * /api/contents:
   *   get:
   *     summary: 홈 화면용 콘텐츠 목록을 조회합니다.
   *     description: 로그인한 사용자의 경우 찜 목록 정보를 포함합니다.
   *     tags: [Contents]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 콘텐츠 목록 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ContentListResponse'
   *       401:
   *         description: 인증 토큰이 만료되었거나 유효하지 않음
   *       500:
   *         description: 서버 에러
   */
  async getContents(req: Request, res: Response): Promise<void> {
    try {
      // JWT 인증 미들웨어를 통과한 경우 req.user에 사용자 정보가 있음
      const userId = req.user ? (req.user as any).id : undefined;

      const contents = await this.contentService.getAllContents(userId);

      const response: ContentListResponse = {
        contents,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("콘텐츠 목록 조회 실패:", error);
      res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
  }

  /**
   * @swagger
   * /api/contents/genre/{genreId}:
   *   get:
   *     summary: 장르별 콘텐츠 목록을 조회합니다.
   *     description: 특정 장르에 해당하는 콘텐츠만 필터링하여 조회합니다.
   *     tags: [Contents]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: genreId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 장르 ID
   *     responses:
   *       200:
   *         description: 장르별 콘텐츠 목록 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ContentListResponse'
   *       401:
   *         description: 인증 토큰이 만료되었거나 유효하지 않음
   *       404:
   *         description: 해당 장르가 존재하지 않음
   *       500:
   *         description: 서버 에러
   */
  async getContentsByGenre(req: Request, res: Response): Promise<void> {
    try {
      const genreId = parseInt(req.params.genreId);

      if (isNaN(genreId)) {
        res.status(400).json({ message: "유효하지 않은 장르 ID입니다." });
        return;
      }

      // JWT 인증 미들웨어를 통과한 경우 req.user에 사용자 정보가 있음
      const userId = req.user ? (req.user as any).id : undefined;

      const contents = await this.contentService.getContentsByGenre(
        genreId,
        userId
      );

      const response: ContentListResponse = {
        contents,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("장르별 콘텐츠 목록 조회 실패:", error);
      res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
  }
}
