import { getRepository } from "typeorm";
import { Content } from "../../models/Content";
import { Wishlist } from "../../models/Wishlist";
import { ContentService } from "../ContentService";

// typeorm 모킹
jest.mock("typeorm", () => {
  const actual = jest.requireActual("typeorm");
  return {
    ...actual,
    getRepository: jest.fn(),
    Like: jest.fn((query) => `LIKE:${query}`),
  };
});

describe("ContentService", () => {
  let contentService: ContentService;
  let mockContentRepository: any;
  let mockWishlistRepository: any;

  beforeEach(() => {
    // 모의 저장소 생성
    mockContentRepository = {
      find: jest.fn(),
    };

    mockWishlistRepository = {
      find: jest.fn(),
    };

    // getRepository 모킹
    (getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Content) {
        return mockContentRepository;
      }
      if (entity === Wishlist) {
        return mockWishlistRepository;
      }
      return {};
    });

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
});
