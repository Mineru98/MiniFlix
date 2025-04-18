import { getRepository } from "typeorm";
import { Content } from "../../models/Content";
import { ViewingHistory } from "../../models/ViewingHistory";
import { ContentService } from "../ContentService";

// getRepository 모킹
jest.mock("typeorm", () => ({
  getRepository: jest.fn(),
  getManager: jest.fn(),
}));

describe("ContentService - 재생 기능 테스트", () => {
  let contentService: ContentService;
  let mockContentRepository: any;
  let mockViewingHistoryRepository: any;

  beforeEach(() => {
    // 모킹 초기화
    mockContentRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    mockViewingHistoryRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    };

    // getRepository 모킹 설정
    (getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Content) return mockContentRepository;
      if (entity === ViewingHistory) return mockViewingHistoryRepository;
      return {};
    });

    contentService = new ContentService();
  });

  describe("getStreamingInfo", () => {
    it("콘텐츠 정보와 이전 시청 위치를 함께 제공한다", async () => {
      // Given
      const contentId = 1;
      const userId = 123;
      const mockContent = {
        id: contentId,
        title: "테스트 영화",
        video_url: "https://example.com/videos/test.mp4",
      };

      const mockViewingHistory = {
        id: 1,
        user: { id: userId },
        content: { id: contentId },
        last_position: 600, // 10분
        watch_duration: 650,
        is_completed: false,
      };

      mockContentRepository.findOne.mockResolvedValue(mockContent);
      mockViewingHistoryRepository.findOne.mockResolvedValue(
        mockViewingHistory
      );

      // When
      const result = await contentService.getStreamingInfo(contentId, userId);

      // Then
      expect(mockContentRepository.findOne).toHaveBeenCalledWith({
        where: { id: contentId },
      });

      expect(mockViewingHistoryRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: userId },
          content: { id: contentId },
        },
        order: { watched_at: "DESC" },
      });

      expect(result).toEqual({
        streaming_url: mockContent.video_url,
        last_position: mockViewingHistory.last_position,
      });
    });

    it("시청 기록이 없는 경우 재생 위치를 0으로 제공한다", async () => {
      // Given
      const contentId = 1;
      const userId = 123;
      const mockContent = {
        id: contentId,
        title: "테스트 영화",
        video_url: "https://example.com/videos/test.mp4",
      };

      mockContentRepository.findOne.mockResolvedValue(mockContent);
      mockViewingHistoryRepository.findOne.mockResolvedValue(null); // 시청 기록 없음

      // When
      const result = await contentService.getStreamingInfo(contentId, userId);

      // Then
      expect(result).toEqual({
        streaming_url: mockContent.video_url,
        last_position: 0,
      });
    });

    it("존재하지 않는 콘텐츠에 대해 에러를 발생시킨다", async () => {
      // Given
      const contentId = 999;
      const userId = 123;

      mockContentRepository.findOne.mockResolvedValue(null); // 콘텐츠 없음

      // When, Then
      await expect(
        contentService.getStreamingInfo(contentId, userId)
      ).rejects.toThrow("존재하지 않는 콘텐츠입니다.");
    });
  });

  describe("updatePlaybackPosition", () => {
    it("시청 기록이 있는 경우 재생 위치를 업데이트한다", async () => {
      // Given
      const contentId = 1;
      const userId = 123;
      const currentPosition = 750; // 12분 30초

      const mockContent = {
        id: contentId,
        title: "테스트 영화",
      };

      const mockViewingHistory = {
        id: 1,
        user: { id: userId },
        content: { id: contentId },
        last_position: 600, // 10분
        watch_duration: 650,
        is_completed: false,
      };

      mockContentRepository.findOne.mockResolvedValue(mockContent);
      mockViewingHistoryRepository.findOne.mockResolvedValue(
        mockViewingHistory
      );

      // When
      await contentService.updatePlaybackPosition(
        contentId,
        userId,
        currentPosition
      );

      // Then
      expect(mockViewingHistoryRepository.save).toHaveBeenCalledWith({
        ...mockViewingHistory,
        last_position: currentPosition,
      });
    });

    it("시청 기록이 없는 경우 새로운 기록을 생성한다", async () => {
      // Given
      const contentId = 1;
      const userId = 123;
      const currentPosition = 300; // 5분

      const mockContent = {
        id: contentId,
        title: "테스트 영화",
      };

      mockContentRepository.findOne.mockResolvedValue(mockContent);
      mockViewingHistoryRepository.findOne.mockResolvedValue(null); // 시청 기록 없음

      // When
      await contentService.updatePlaybackPosition(
        contentId,
        userId,
        currentPosition
      );

      // Then
      expect(mockViewingHistoryRepository.save).toHaveBeenCalledWith({
        user: { id: userId },
        content: { id: contentId },
        last_position: currentPosition,
        watch_duration: 0,
        is_completed: false,
      });
    });
  });

  describe("updateFinalPlaybackInfo", () => {
    it("시청 기록이 있는 경우 최종 정보를 업데이트한다", async () => {
      // Given
      const contentId = 1;
      const userId = 123;
      const finalPosition = 1500; // 25분
      const watchDuration = 1550; // 25분 50초
      const isCompleted = true;

      const mockContent = {
        id: contentId,
        title: "테스트 영화",
      };

      const mockViewingHistory = {
        id: 1,
        user: { id: userId },
        content: { id: contentId },
        last_position: 900, // 15분
        watch_duration: 950,
        is_completed: false,
      };

      mockContentRepository.findOne.mockResolvedValue(mockContent);
      mockViewingHistoryRepository.findOne.mockResolvedValue(
        mockViewingHistory
      );

      // When
      await contentService.updateFinalPlaybackInfo(
        contentId,
        userId,
        finalPosition,
        watchDuration,
        isCompleted
      );

      // Then
      expect(mockViewingHistoryRepository.save).toHaveBeenCalledWith({
        ...mockViewingHistory,
        last_position: finalPosition,
        watch_duration: watchDuration,
        is_completed: isCompleted,
      });
    });

    it("시청 기록이 없는 경우 새로운 기록을 생성한다", async () => {
      // Given
      const contentId = 1;
      const userId = 123;
      const finalPosition = 1500; // 25분
      const watchDuration = 1550; // 25분 50초
      const isCompleted = true;

      const mockContent = {
        id: contentId,
        title: "테스트 영화",
      };

      mockContentRepository.findOne.mockResolvedValue(mockContent);
      mockViewingHistoryRepository.findOne.mockResolvedValue(null); // 시청 기록 없음

      // When
      await contentService.updateFinalPlaybackInfo(
        contentId,
        userId,
        finalPosition,
        watchDuration,
        isCompleted
      );

      // Then
      expect(mockViewingHistoryRepository.save).toHaveBeenCalledWith({
        user: { id: userId },
        content: { id: contentId },
        last_position: finalPosition,
        watch_duration: watchDuration,
        is_completed: isCompleted,
      });
    });
  });
});
