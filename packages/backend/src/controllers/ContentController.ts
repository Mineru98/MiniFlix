import { Request, Response } from "express";
import {
  ContentDetailResponse,
  ContentListResponse,
  ContentSearchResponse,
} from "../models/Content";
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

      try {
        const contents = await this.contentService.getContentsByGenre(
          genreId,
          userId
        );

        const response: ContentListResponse = {
          contents,
        };

        res.status(200).json(response);
      } catch (error: any) {
        if (error.message === "존재하지 않는 장르입니다.") {
          res.status(404).json({ message: error.message });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("장르별 콘텐츠 목록 조회 실패:", error);
      res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
  }

  /**
   * @swagger
   * /api/contents/search:
   *   get:
   *     summary: 제목으로 콘텐츠를 검색합니다.
   *     description: 검색어와 일치하는 제목을 가진 콘텐츠를 검색합니다. 로그인한 사용자의 경우 찜 목록 정보를 포함합니다.
   *     tags: [Contents]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: 검색어
   *     responses:
   *       200:
   *         description: 콘텐츠 검색 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ContentSearchResponse'
   *       400:
   *         description: 검색어가 없거나 유효하지 않음
   *       401:
   *         description: 인증 토큰이 만료되었거나 유효하지 않음
   *       500:
   *         description: 서버 에러
   */
  async searchContents(req: Request, res: Response): Promise<void> {
    try {
      const searchQuery = req.query.q as string;

      if (!searchQuery || searchQuery.trim() === "") {
        res.status(400).json({ message: "검색어를 입력해주세요." });
        return;
      }

      // JWT 인증 미들웨어를 통과한 경우 req.user에 사용자 정보가 있음
      const userId = req.user ? (req.user as any).id : undefined;

      const contents = await this.contentService.searchContents(
        searchQuery,
        userId
      );

      const response: ContentSearchResponse = {
        contents,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("콘텐츠 검색 실패:", error);
      res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
  }

  /**
   * @swagger
   * /api/contents/{id}:
   *   get:
   *     summary: 콘텐츠 상세 정보를 조회합니다.
   *     description: 콘텐츠의 모든 정보와 장르 정보를 포함합니다. 로그인한 사용자의 경우 찜 상태와 시청 기록을 포함합니다.
   *     tags: [Contents]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: 콘텐츠 ID
   *     responses:
   *       200:
   *         description: 콘텐츠 상세 정보 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ContentDetailResponse'
   *       401:
   *         description: 인증 토큰이 만료되었거나 유효하지 않음
   *       404:
   *         description: 해당 콘텐츠가 존재하지 않음
   *       500:
   *         description: 서버 에러
   */
  async getContentDetail(req: Request, res: Response): Promise<void> {
    try {
      const contentId = parseInt(req.params.id);

      if (isNaN(contentId)) {
        res.status(400).json({ message: "유효하지 않은 콘텐츠 ID입니다." });
        return;
      }

      // JWT 인증 미들웨어를 통과한 경우 req.user에 사용자 정보가 있음
      const userId = req.user ? (req.user as any).id : undefined;

      try {
        const content = await this.contentService.getContentDetail(
          contentId,
          userId
        );

        const response: ContentDetailResponse = {
          content,
        };

        res.status(200).json(response);
      } catch (error: any) {
        if (error.message === "존재하지 않는 콘텐츠입니다.") {
          res.status(404).json({ message: error.message });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("콘텐츠 상세 정보 조회 실패:", error);
      res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
  }
}
