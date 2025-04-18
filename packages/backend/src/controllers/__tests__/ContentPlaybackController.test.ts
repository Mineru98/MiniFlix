import { Request, Response } from "express";
import { StreamingInfoResponse } from "../../models/ViewingHistory";
import { ContentService } from "../../services/ContentService";
import { ContentController } from "../ContentController";

// ContentService 모킹
jest.mock("../../services/ContentService");

describe("ContentController - 재생 기능 테스트", () => {
  let contentController: ContentController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockContentService: jest.Mocked<ContentService>;

  beforeEach(() => {
    // ContentService 모킹 설정
    mockContentService = new ContentService() as jest.Mocked<ContentService>;

    // 모킹된 response 객체 생성
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    contentController = new ContentController();
    (contentController as any).contentService = mockContentService;
  });

  describe("getStreamingInfo", () => {
    it("로그인한 사용자가 존재하는 콘텐츠의 스트리밍 정보를 조회할 수 있다", async () => {
      // Given
      const contentId = 1;
      const userId = 123;
      const mockStreamingInfo: StreamingInfoResponse = {
        streaming_url: "https://example.com/videos/sample.mp4",
        last_position: 300, // 이전에 5분(300초)까지 시청
      };

      mockRequest = {
        params: { id: contentId.toString() },
        user: { id: userId },
      };

      mockContentService.getStreamingInfo = jest
        .fn()
        .mockResolvedValue(mockStreamingInfo);

      // When
      await contentController.getStreamingInfo(
        mockRequest as Request,
        mockResponse as Response
      );

      // Then
      expect(mockContentService.getStreamingInfo).toHaveBeenCalledWith(
        contentId,
        userId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockStreamingInfo);
    });

    it("유효하지 않은 콘텐츠 ID를 요청하면 400 응답을 반환한다", async () => {
      // Given
      mockRequest = {
        params: { id: "invalid-id" },
        user: { id: 123 },
      };

      // When
      await contentController.getStreamingInfo(
        mockRequest as Request,
        mockResponse as Response
      );

      // Then
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "유효하지 않은 콘텐츠 ID입니다.",
      });
    });

    it("존재하지 않는 콘텐츠를 요청하면 404 응답을 반환한다", async () => {
      // Given
      const contentId = 999;
      const userId = 123;

      mockRequest = {
        params: { id: contentId.toString() },
        user: { id: userId },
      };

      mockContentService.getStreamingInfo = jest
        .fn()
        .mockRejectedValue(new Error("존재하지 않는 콘텐츠입니다."));

      // When
      await contentController.getStreamingInfo(
        mockRequest as Request,
        mockResponse as Response
      );

      // Then
      expect(mockContentService.getStreamingInfo).toHaveBeenCalledWith(
        contentId,
        userId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "존재하지 않는 콘텐츠입니다.",
      });
    });
  });

  describe("updatePlaybackPosition", () => {
    it("로그인한 사용자가 재생 위치를 업데이트할 수 있다", async () => {
      // Given
      const contentId = 1;
      const userId = 123;
      const currentPosition = 450; // 7분 30초

      mockRequest = {
        user: { id: userId },
        body: {
          content_id: contentId,
          current_position: currentPosition,
        },
      };

      mockContentService.updatePlaybackPosition = jest
        .fn()
        .mockResolvedValue(undefined);

      // When
      await contentController.updatePlaybackPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      // Then
      expect(mockContentService.updatePlaybackPosition).toHaveBeenCalledWith(
        contentId,
        userId,
        currentPosition
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "재생 위치가 업데이트되었습니다.",
      });
    });

    it("유효하지 않은 요청 데이터를 보내면 400 응답을 반환한다", async () => {
      // Given
      mockRequest = {
        user: { id: 123 },
        body: {
          content_id: 1,
          current_position: -10, // 음수 위치는 불가능
        },
      };

      // When
      await contentController.updatePlaybackPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      // Then
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "유효하지 않은 요청 데이터입니다.",
      });
    });
  });

  describe("updateFinalPlaybackInfo", () => {
    it("로그인한 사용자가 최종 재생 정보를 업데이트할 수 있다", async () => {
      // Given
      const contentId = 1;
      const userId = 123;
      const finalPosition = 1800; // 30분
      const watchDuration = 1750; // 29분 10초
      const isCompleted = true;

      mockRequest = {
        user: { id: userId },
        body: {
          content_id: contentId,
          final_position: finalPosition,
          watch_duration: watchDuration,
          is_completed: isCompleted,
        },
      };

      mockContentService.updateFinalPlaybackInfo = jest
        .fn()
        .mockResolvedValue(undefined);

      // When
      await contentController.updateFinalPlaybackInfo(
        mockRequest as Request,
        mockResponse as Response
      );

      // Then
      expect(mockContentService.updateFinalPlaybackInfo).toHaveBeenCalledWith(
        contentId,
        userId,
        finalPosition,
        watchDuration,
        isCompleted
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "시청 정보가 저장되었습니다.",
      });
    });

    it("유효하지 않은 요청 데이터를 보내면 400 응답을 반환한다", async () => {
      // Given
      mockRequest = {
        user: { id: 123 },
        body: {
          content_id: "invalid", // 숫자가 아닌 ID
          final_position: 1800,
          watch_duration: 1750,
        },
      };

      // When
      await contentController.updateFinalPlaybackInfo(
        mockRequest as Request,
        mockResponse as Response
      );

      // Then
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "유효하지 않은 요청 데이터입니다.",
      });
    });
  });
});
