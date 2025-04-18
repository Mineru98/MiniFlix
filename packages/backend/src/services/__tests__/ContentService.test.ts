import { getManager, getRepository } from "typeorm";
import { Content } from "../../models/Content";
import { ViewingHistory } from "../../models/ViewingHistory";
import { Wishlist } from "../../models/Wishlist";
import { ContentService } from "../ContentService";

// typeorm 모킹
jest.mock("typeorm", () => {
  const actual = jest.requireActual("typeorm");
  return {
    ...actual,
    getRepository: jest.fn(),
    getManager: jest.fn(),
    Like: jest.fn((query) => `LIKE:${query}`),
  };
});

describe("ContentService", () => {
  let contentService: ContentService;
  let mockContentRepository: any;
  let mockWishlistRepository: any;
  let mockViewingHistoryRepository: any;
  let mockEntityManager: any;

  beforeEach(() => {
    // 모의 저장소 생성
    mockContentRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    mockWishlistRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    mockViewingHistoryRepository = {
      findOne: jest.fn(),
    };

    mockEntityManager = {
      query: jest.fn(),
    };

    // getRepository 모킹
    (getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Content) {
        return mockContentRepository;
      }
      if (entity === Wishlist) {
        return mockWishlistRepository;
      }
      if (entity === ViewingHistory) {
        return mockViewingHistoryRepository;
      }
      return {};
    });

    // getManager 모킹
    (getManager as jest.Mock).mockReturnValue(mockEntityManager);

    contentService = new ContentService();
  });

  describe("searchContents", () => {
    it("비로그인 사용자: 제목 기반 검색 결과를 반환해야 함", async () => {
      // 검색 결과 모킹
      const mockContents = [
        {
          id: 1,
          title: "테스트 영화",
          thumbnail_url: "test1.jpg",
          release_year: 2022,
        },
        {
          id: 2,
          title: "테스트 드라마",
          thumbnail_url: "test2.jpg",
          release_year: 2023,
        },
      ];

      mockContentRepository.find.mockResolvedValue(mockContents);

      // 검색 실행
      const result = await contentService.searchContents("테스트");

      // 저장소 호출 검증
      expect(mockContentRepository.find).toHaveBeenCalledWith({
        select: ["id", "title", "thumbnail_url", "release_year"],
        where: {
          title: "LIKE:%테스트%",
        },
      });

      // 찜 목록 저장소는 호출되지 않아야 함
      expect(mockWishlistRepository.find).not.toHaveBeenCalled();

      // 결과 검증
      expect(result).toEqual([
        {
          id: 1,
          title: "테스트 영화",
          thumbnail_url: "test1.jpg",
          release_year: 2022,
        },
        {
          id: 2,
          title: "테스트 드라마",
          thumbnail_url: "test2.jpg",
          release_year: 2023,
        },
      ]);
    });

    it("로그인 사용자: 제목 기반 검색 결과에 찜 정보를 포함해야 함", async () => {
      // 검색 결과 모킹
      const mockContents = [
        {
          id: 1,
          title: "테스트 영화",
          thumbnail_url: "test1.jpg",
          release_year: 2022,
        },
        {
          id: 2,
          title: "테스트 드라마",
          thumbnail_url: "test2.jpg",
          release_year: 2023,
        },
        {
          id: 3,
          title: "또 다른 테스트",
          thumbnail_url: "test3.jpg",
          release_year: 2021,
        },
      ];

      // 찜 목록 모킹
      const mockWishlists = [
        {
          content: { id: 1 },
        },
        {
          content: { id: 3 },
        },
      ];

      mockContentRepository.find.mockResolvedValue(mockContents);
      mockWishlistRepository.find.mockResolvedValue(mockWishlists);

      // 검색 실행
      const result = await contentService.searchContents("테스트", 1);

      // 저장소 호출 검증
      expect(mockContentRepository.find).toHaveBeenCalledWith({
        select: ["id", "title", "thumbnail_url", "release_year"],
        where: {
          title: "LIKE:%테스트%",
        },
      });

      // 찜 목록 저장소 호출 검증
      expect(mockWishlistRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ["content"],
      });

      // 결과 검증
      expect(result).toEqual([
        {
          id: 1,
          title: "테스트 영화",
          thumbnail_url: "test1.jpg",
          release_year: 2022,
          is_wished: true,
        },
        {
          id: 2,
          title: "테스트 드라마",
          thumbnail_url: "test2.jpg",
          release_year: 2023,
          is_wished: false,
        },
        {
          id: 3,
          title: "또 다른 테스트",
          thumbnail_url: "test3.jpg",
          release_year: 2021,
          is_wished: true,
        },
      ]);
    });

    it("검색 결과가 없을 경우 빈 배열을 반환해야 함", async () => {
      // 검색 결과 없음 모킹
      mockContentRepository.find.mockResolvedValue([]);

      // 검색 실행
      const result = await contentService.searchContents("존재하지않는검색어");

      // 저장소 호출 검증
      expect(mockContentRepository.find).toHaveBeenCalledWith({
        select: ["id", "title", "thumbnail_url", "release_year"],
        where: {
          title: "LIKE:%존재하지않는검색어%",
        },
      });

      // 결과 검증
      expect(result).toEqual([]);
    });
  });

  describe("getContentDetail", () => {
    it("비로그인 사용자: 콘텐츠 상세 정보를 기본 내용만 반환해야 함", async () => {
      // 콘텐츠 정보 모킹
      const mockContent = {
        id: 1,
        title: "테스트 영화",
        description: "테스트 영화 설명",
        thumbnail_url: "test.jpg",
        video_url: "test.mp4",
        duration: 7200,
        release_year: 2022,
      };

      // 장르 정보 모킹
      const mockGenres = [
        { id: 1, name: "액션", description: "액션 장르" },
        { id: 2, name: "드라마", description: "드라마 장르" },
      ];

      mockContentRepository.findOne.mockResolvedValue(mockContent);
      mockEntityManager.query.mockResolvedValue(mockGenres);

      // 콘텐츠 상세 조회 실행
      const result = await contentService.getContentDetail(1);

      // 저장소 호출 검증
      expect(mockContentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(mockEntityManager.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE cg.content_id = ?"),
        [1]
      );

      // 찜 목록 저장소는 호출되지 않아야 함
      expect(mockWishlistRepository.findOne).not.toHaveBeenCalled();
      // 시청 기록 저장소도 호출되지 않아야 함
      expect(mockViewingHistoryRepository.findOne).not.toHaveBeenCalled();

      // 결과 검증
      expect(result).toEqual({
        id: 1,
        title: "테스트 영화",
        description: "테스트 영화 설명",
        thumbnail_url: "test.jpg",
        video_url: "test.mp4",
        duration: 7200,
        release_year: 2022,
        genres: [
          { id: 1, name: "액션", description: "액션 장르" },
          { id: 2, name: "드라마", description: "드라마 장르" },
        ],
      });
    });

    it("로그인 사용자: 콘텐츠 상세 정보에 찜 정보와 시청 위치를 포함해야 함", async () => {
      // 콘텐츠 정보 모킹
      const mockContent = {
        id: 1,
        title: "테스트 영화",
        description: "테스트 영화 설명",
        thumbnail_url: "test.jpg",
        video_url: "test.mp4",
        duration: 7200,
        release_year: 2022,
      };

      // 장르 정보 모킹
      const mockGenres = [
        { id: 1, name: "액션", description: "액션 장르" },
        { id: 2, name: "드라마", description: "드라마 장르" },
      ];

      // 찜 정보 모킹
      const mockWishlist = { id: 1, user: { id: 1 }, content: { id: 1 } };

      // 시청 기록 모킹
      const mockViewingHistory = {
        id: 1,
        user: { id: 1 },
        content: { id: 1 },
        last_position: 3600,
        watch_duration: 3600,
        is_completed: false,
      };

      mockContentRepository.findOne.mockResolvedValue(mockContent);
      mockEntityManager.query.mockResolvedValue(mockGenres);
      mockWishlistRepository.findOne.mockResolvedValue(mockWishlist);
      mockViewingHistoryRepository.findOne.mockResolvedValue(
        mockViewingHistory
      );

      // 콘텐츠 상세 조회 실행
      const result = await contentService.getContentDetail(1, 1);

      // 저장소 호출 검증
      expect(mockContentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(mockEntityManager.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE cg.content_id = ?"),
        [1]
      );

      // 찜 목록 저장소 호출 검증
      expect(mockWishlistRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: 1 },
          content: { id: 1 },
        },
      });

      // 시청 기록 저장소 호출 검증
      expect(mockViewingHistoryRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: 1 },
          content: { id: 1 },
        },
        order: { watched_at: "DESC" },
      });

      // 결과 검증
      expect(result).toEqual({
        id: 1,
        title: "테스트 영화",
        description: "테스트 영화 설명",
        thumbnail_url: "test.jpg",
        video_url: "test.mp4",
        duration: 7200,
        release_year: 2022,
        genres: [
          { id: 1, name: "액션", description: "액션 장르" },
          { id: 2, name: "드라마", description: "드라마 장르" },
        ],
        is_wished: true,
        last_position: 3600,
      });
    });

    it("콘텐츠가 존재하지 않을 경우 에러를 발생시켜야 함", async () => {
      // 콘텐츠 없음 모킹
      mockContentRepository.findOne.mockResolvedValue(null);

      // 콘텐츠 상세 조회 실행 및 에러 검증
      await expect(contentService.getContentDetail(999)).rejects.toThrow(
        "존재하지 않는 콘텐츠입니다."
      );

      // 저장소 호출 검증
      expect(mockContentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });

      // 다른 메서드는 호출되지 않아야 함
      expect(mockEntityManager.query).not.toHaveBeenCalled();
    });

    it("로그인 사용자이지만 찜하지 않고 시청 기록도 없는 경우", async () => {
      // 콘텐츠 정보 모킹
      const mockContent = {
        id: 1,
        title: "테스트 영화",
        description: "테스트 영화 설명",
        thumbnail_url: "test.jpg",
        video_url: "test.mp4",
        duration: 7200,
        release_year: 2022,
      };

      // 장르 정보 모킹
      const mockGenres = [{ id: 1, name: "액션", description: "액션 장르" }];

      mockContentRepository.findOne.mockResolvedValue(mockContent);
      mockEntityManager.query.mockResolvedValue(mockGenres);
      mockWishlistRepository.findOne.mockResolvedValue(null);
      mockViewingHistoryRepository.findOne.mockResolvedValue(null);

      // 콘텐츠 상세 조회 실행
      const result = await contentService.getContentDetail(1, 1);

      // 저장소 호출 검증
      expect(mockWishlistRepository.findOne).toHaveBeenCalled();
      expect(mockViewingHistoryRepository.findOne).toHaveBeenCalled();

      // 결과 검증 (찜 정보와 시청 위치가 없음)
      expect(result).toEqual({
        id: 1,
        title: "테스트 영화",
        description: "테스트 영화 설명",
        thumbnail_url: "test.jpg",
        video_url: "test.mp4",
        duration: 7200,
        release_year: 2022,
        genres: [{ id: 1, name: "액션", description: "액션 장르" }],
        is_wished: false,
      });
    });
  });
});
