import { Request, Response } from "express";
import {
  ContentDetailResponse,
  ContentListResponse,
  ContentSearchResponse,
} from "../models/Content";
import {
  PlaybackFinalUpdateDTO,
  PlaybackPositionUpdateDTO,
} from "../models/ViewingHistory";
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

  /**
   * @swagger
   * /api/contents/{id}/stream:
   *   get:
   *     summary: 콘텐츠 스트리밍 정보를 제공합니다.
   *     description: 비디오 스트리밍 URL과 마지막 시청 위치를 반환합니다. 로그인된 사용자만 접근 가능합니다.
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
   *         description: 스트리밍 정보 제공 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StreamingInfoResponse'
   *       401:
   *         description: 인증 실패 또는 로그인 필요
   *       404:
   *         description: 콘텐츠를 찾을 수 없음
   *       500:
   *         description: 서버 에러
   */
  async getStreamingInfo(req: Request, res: Response): Promise<void> {
    try {
      // 로그인 필수이므로 req.user가 항상 존재함
      const userId = (req.user as any).id;
      const contentId = parseInt(req.params.id);

      if (isNaN(contentId)) {
        res.status(400).json({ message: "유효하지 않은 콘텐츠 ID입니다." });
        return;
      }

      try {
        const streamingInfo = await this.contentService.getStreamingInfo(
          contentId,
          userId
        );

        res.status(200).json(streamingInfo);
      } catch (error: any) {
        if (error.message === "존재하지 않는 콘텐츠입니다.") {
          res.status(404).json({ message: error.message });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("스트리밍 정보 조회 실패:", error);
      res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
  }

  /**
   * @swagger
   * /api/contents/playback/position:
   *   post:
   *     summary: 콘텐츠 재생 위치를 업데이트합니다.
   *     description: 현재 재생 중인 위치를 저장합니다. 주기적으로 호출됩니다.
   *     tags: [Contents]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PlaybackPositionUpdateDTO'
   *     responses:
   *       200:
   *         description: 재생 위치 업데이트 성공
   *       401:
   *         description: 인증 실패 또는 로그인 필요
   *       404:
   *         description: 콘텐츠를 찾을 수 없음
   *       500:
   *         description: 서버 에러
   */
  async updatePlaybackPosition(req: Request, res: Response): Promise<void> {
    try {
      // 로그인 필수이므로 req.user가 항상 존재함
      const userId = (req.user as any).id;
      const { content_id, current_position } =
        req.body as PlaybackPositionUpdateDTO;

      if (
        content_id === undefined ||
        current_position === undefined ||
        isNaN(content_id) ||
        isNaN(current_position) ||
        current_position < 0
      ) {
        res.status(400).json({ message: "유효하지 않은 요청 데이터입니다." });
        return;
      }

      try {
        await this.contentService.updatePlaybackPosition(
          content_id,
          userId,
          current_position
        );

        res.status(200).json({ message: "재생 위치가 업데이트되었습니다." });
      } catch (error: any) {
        if (error.message === "존재하지 않는 콘텐츠입니다.") {
          res.status(404).json({ message: error.message });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("재생 위치 업데이트 실패:", error);
      res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
  }

  /**
   * @swagger
   * /api/contents/playback/final:
   *   post:
   *     summary: 콘텐츠 재생 종료 시 최종 정보를 업데이트합니다.
   *     description: 재생 종료 시 마지막 위치, 총 시청 시간, 완료 여부를 저장합니다.
   *     tags: [Contents]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PlaybackFinalUpdateDTO'
   *     responses:
   *       200:
   *         description: 최종 재생 정보 업데이트 성공
   *       401:
   *         description: 인증 실패 또는 로그인 필요
   *       404:
   *         description: 콘텐츠를 찾을 수 없음
   *       500:
   *         description: 서버 에러
   */
  async updateFinalPlaybackInfo(req: Request, res: Response): Promise<void> {
    try {
      // 로그인 필수이므로 req.user가 항상 존재함
      const userId = (req.user as any).id;
      const { content_id, final_position, watch_duration, is_completed } =
        req.body as PlaybackFinalUpdateDTO;

      if (
        content_id === undefined ||
        final_position === undefined ||
        watch_duration === undefined ||
        isNaN(content_id) ||
        isNaN(final_position) ||
        isNaN(watch_duration) ||
        final_position < 0 ||
        watch_duration < 0
      ) {
        res.status(400).json({ message: "유효하지 않은 요청 데이터입니다." });
        return;
      }

      try {
        await this.contentService.updateFinalPlaybackInfo(
          content_id,
          userId,
          final_position,
          watch_duration,
          is_completed || false
        );

        res.status(200).json({ message: "시청 정보가 저장되었습니다." });
      } catch (error: any) {
        if (error.message === "존재하지 않는 콘텐츠입니다.") {
          res.status(404).json({ message: error.message });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("시청 정보 저장 실패:", error);
      res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
  }
}
