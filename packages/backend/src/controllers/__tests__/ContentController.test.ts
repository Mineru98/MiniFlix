import { Request, Response } from "express";
import { ContentService } from "../../services/ContentService";
import { ContentController } from "../ContentController";

// ContentService 모킹
jest.mock("../../services/ContentService");

describe("ContentController", () => {
  let contentController: ContentController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockContentService: jest.Mocked<ContentService>;

  beforeEach(() => {
    // 응답 객체 모킹
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // ContentService 인스턴스 모킹
    mockContentService = {
      getAllContents: jest.fn(),
      getContentsByGenre: jest.fn(),
      searchContents: jest.fn(),
      getContentDetail: jest.fn(),
    } as unknown as jest.Mocked<ContentService>;

    // ContentController 내부의 contentService 대체
    contentController = new ContentController();
    (contentController as any).contentService = mockContentService;
  });

  describe("searchContents", () => {
    it("로그인하지 않은 사용자가 검색할 때 찜 정보가 없는 콘텐츠 목록을 반환해야 함", async () => {
      // 검색 요청 모킹 (비로그인 상태)
      mockRequest = {
        query: { q: "테스트" },
        user: undefined,
      };

      // 서비스 결과 모킹
      const mockSearchResults = [
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

      mockContentService.searchContents.mockResolvedValue(mockSearchResults);

      // 컨트롤러 메서드 호출
      await contentController.searchContents(
        mockRequest as Request,
        mockResponse as Response
      );

      // 서비스 메서드 호출 검증
      expect(mockContentService.searchContents).toHaveBeenCalledWith(
        "테스트",
        undefined
      );

      // 응답 검증
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        contents: mockSearchResults,
      });
    });

    it("로그인한 사용자가 검색할 때 찜 정보가 포함된 콘텐츠 목록을 반환해야 함", async () => {
      // 검색 요청 모킹 (로그인 상태)
      mockRequest = {
        query: { q: "테스트" },
        user: { id: 1 },
      };

      // 서비스 결과 모킹 (찜 정보 포함)
      const mockSearchResults = [
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
      ];

      mockContentService.searchContents.mockResolvedValue(mockSearchResults);

      // 컨트롤러 메서드 호출
      await contentController.searchContents(
        mockRequest as Request,
        mockResponse as Response
      );

      // 서비스 메서드 호출 검증
      expect(mockContentService.searchContents).toHaveBeenCalledWith(
        "테스트",
        1
      );

      // 응답 검증
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        contents: mockSearchResults,
      });
    });

    it("검색어가 없는 경우 400 에러를 반환해야 함", async () => {
      // 검색어가 없는 요청 모킹
      mockRequest = {
        query: { q: "" },
        user: undefined,
      };

      // 컨트롤러 메서드 호출
      await contentController.searchContents(
        mockRequest as Request,
        mockResponse as Response
      );

      // 서비스 메서드 호출되지 않음 검증
      expect(mockContentService.searchContents).not.toHaveBeenCalled();

      // 응답 검증
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "검색어를 입력해주세요.",
      });
    });

    it("서비스에서 오류가 발생할 경우 500 에러를 반환해야 함", async () => {
      // 검색 요청 모킹
      mockRequest = {
        query: { q: "테스트" },
        user: undefined,
      };

      // 서비스 오류 모킹
      mockContentService.searchContents.mockRejectedValue(
        new Error("DB 오류 발생")
      );

      // 콘솔 에러 스파이
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // 컨트롤러 메서드 호출
      await contentController.searchContents(
        mockRequest as Request,
        mockResponse as Response
      );

      // 서비스 메서드 호출 검증
      expect(mockContentService.searchContents).toHaveBeenCalledWith(
        "테스트",
        undefined
      );

      // 응답 검증
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "서버 에러가 발생했습니다.",
      });

      // 콘솔 에러 출력 검증
      expect(consoleErrorSpy).toHaveBeenCalled();

      // 스파이 복원
      consoleErrorSpy.mockRestore();
    });
  });

  describe("getContentDetail", () => {
    it("로그인하지 않은 사용자가 콘텐츠 상세 정보를 조회할 때 찜 정보와 시청 위치가 없는 콘텐츠 정보를 반환해야 함", async () => {
      // 콘텐츠 상세 요청 모킹 (비로그인 상태)
      mockRequest = {
        params: { id: "1" },
        user: undefined,
      };

      // 서비스 결과 모킹
      const mockContentDetail = {
        id: 1,
        title: "테스트 영화",
        description: "테스트 영화 설명",
        thumbnail_url: "test.jpg",
        video_url: "test.mp4",
        duration: 7200,
        release_year: 2022,
        genres: [
          { id: 1, name: "액션" },
          { id: 2, name: "드라마" },
        ],
      };

      mockContentService.getContentDetail.mockResolvedValue(mockContentDetail);

      // 컨트롤러 메서드 호출
      await contentController.getContentDetail(
        mockRequest as Request,
        mockResponse as Response
      );

      // 서비스 메서드 호출 검증
      expect(mockContentService.getContentDetail).toHaveBeenCalledWith(
        1,
        undefined
      );

      // 응답 검증
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        content: mockContentDetail,
      });
    });

    it("로그인한 사용자가 콘텐츠 상세 정보를 조회할 때 찜 정보와 시청 위치가 포함된 콘텐츠 정보를 반환해야 함", async () => {
      // 콘텐츠 상세 요청 모킹 (로그인 상태)
      mockRequest = {
        params: { id: "1" },
        user: { id: 1 },
      };

      // 서비스 결과 모킹 (찜 정보와 시청 위치 포함)
      const mockContentDetail = {
        id: 1,
        title: "테스트 영화",
        description: "테스트 영화 설명",
        thumbnail_url: "test.jpg",
        video_url: "test.mp4",
        duration: 7200,
        release_year: 2022,
        genres: [
          { id: 1, name: "액션" },
          { id: 2, name: "드라마" },
        ],
        is_wished: true,
        last_position: 3600,
      };

      mockContentService.getContentDetail.mockResolvedValue(mockContentDetail);

      // 컨트롤러 메서드 호출
      await contentController.getContentDetail(
        mockRequest as Request,
        mockResponse as Response
      );

      // 서비스 메서드 호출 검증
      expect(mockContentService.getContentDetail).toHaveBeenCalledWith(1, 1);

      // 응답 검증
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        content: mockContentDetail,
      });
    });

    it("유효하지 않은 콘텐츠 ID를 요청할 경우 400 에러를 반환해야 함", async () => {
      // 유효하지 않은 ID 요청 모킹
      mockRequest = {
        params: { id: "invalid" },
        user: undefined,
      };

      // 컨트롤러 메서드 호출
      await contentController.getContentDetail(
        mockRequest as Request,
        mockResponse as Response
      );

      // 서비스 메서드 호출되지 않음 검증
      expect(mockContentService.getContentDetail).not.toHaveBeenCalled();

      // 응답 검증
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "유효하지 않은 콘텐츠 ID입니다.",
      });
    });

    it("존재하지 않는 콘텐츠를 요청할 경우 404 에러를 반환해야 함", async () => {
      // 콘텐츠 상세 요청 모킹
      mockRequest = {
        params: { id: "999" },
        user: undefined,
      };

      // 서비스 오류 모킹 (콘텐츠 없음)
      mockContentService.getContentDetail.mockRejectedValue(
        new Error("존재하지 않는 콘텐츠입니다.")
      );

      // 컨트롤러 메서드 호출
      await contentController.getContentDetail(
        mockRequest as Request,
        mockResponse as Response
      );

      // 서비스 메서드 호출 검증
      expect(mockContentService.getContentDetail).toHaveBeenCalledWith(
        999,
        undefined
      );

      // 응답 검증
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "존재하지 않는 콘텐츠입니다.",
      });
    });

    it("서비스에서 오류가 발생할 경우 500 에러를 반환해야 함", async () => {
      // 콘텐츠 상세 요청 모킹
      mockRequest = {
        params: { id: "1" },
        user: undefined,
      };

      // 서비스 일반 오류 모킹
      mockContentService.getContentDetail.mockRejectedValue(
        new Error("DB 오류 발생")
      );

      // 콘솔 에러 스파이
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // 컨트롤러 메서드 호출
      await contentController.getContentDetail(
        mockRequest as Request,
        mockResponse as Response
      );

      // 서비스 메서드 호출 검증
      expect(mockContentService.getContentDetail).toHaveBeenCalledWith(
        1,
        undefined
      );

      // 응답 검증
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "서버 에러가 발생했습니다.",
      });

      // 콘솔 에러 출력 검증
      expect(consoleErrorSpy).toHaveBeenCalled();

      // 스파이 복원
      consoleErrorSpy.mockRestore();
    });
  });
});
