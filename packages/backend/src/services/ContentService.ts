import { getManager, getRepository, Like } from "typeorm";
import {
  Content,
  ContentDetailResponseDTO,
  ContentListResponseDTO,
  ContentSearchResponseDTO,
} from "../models/Content";
import { Genre } from "../models/Genre";
import {
  StreamingInfoResponse,
  ViewingHistory,
} from "../models/ViewingHistory";
import { Wishlist } from "../models/Wishlist";

export class ContentService {
  /**
   * 모든 콘텐츠를 조회합니다.
   * 로그인 상태인 경우 사용자의 찜 목록 정보를 포함합니다.
   *
   * @param userId 로그인한 사용자의 ID (옵션)
   * @returns 콘텐츠 목록
   */
  async getAllContents(userId?: number): Promise<ContentListResponseDTO[]> {
    const contentRepository = getRepository(Content);

    // 기본 콘텐츠 정보 조회
    const contents = await contentRepository.find({
      select: ["id", "title", "thumbnail_url", "release_year"],
    });

    // 비로그인 상태인 경우 기본 정보만 반환
    if (!userId) {
      return contents.map((content) => ({
        id: content.id,
        title: content.title,
        thumbnail_url: content.thumbnail_url,
        release_year: content.release_year,
      }));
    }

    // 로그인 상태인 경우 찜 목록 정보 추가
    const wishlistRepository = getRepository(Wishlist);
    const wishlists = await wishlistRepository.find({
      where: { user: { id: userId } },
      relations: ["content"],
    });

    // 찜한 콘텐츠 ID 목록
    const wishedContentIds = new Set(
      wishlists.map((wishlist) => wishlist.content.id)
    );

    // 콘텐츠에 찜 상태 정보 추가
    return contents.map((content) => ({
      id: content.id,
      title: content.title,
      thumbnail_url: content.thumbnail_url,
      release_year: content.release_year,
      is_wished: wishedContentIds.has(content.id),
    }));
  }

  /**
   * 장르별로 콘텐츠를 필터링합니다.
   *
   * @param genreId 장르 ID
   * @param userId 로그인한 사용자의 ID (옵션)
   * @returns 필터링된 콘텐츠 목록
   */
  async getContentsByGenre(
    genreId: number,
    userId?: number
  ): Promise<ContentListResponseDTO[]> {
    const entityManager = getManager();
    const genreRepository = getRepository(Genre);

    // 장르가 존재하는지 확인
    const genre = await genreRepository.findOne({ where: { id: genreId } });
    if (!genre) {
      throw new Error("존재하지 않는 장르입니다.");
    }

    // 장르별 콘텐츠 조회 (ContentGenre 조인)
    const contents = await entityManager.query(
      `
      SELECT c.id, c.title, c.thumbnail_url, c.release_year
      FROM contents c
      JOIN content_genres cg ON c.id = cg.content_id
      WHERE cg.genre_id = ?
    `,
      [genreId]
    );

    // 비로그인 상태인 경우 기본 정보만 반환
    if (!userId) {
      return contents;
    }

    // 로그인 상태인 경우 찜 목록 정보 추가
    const wishlistRepository = getRepository(Wishlist);
    const wishlists = await wishlistRepository.find({
      where: { user: { id: userId } },
      relations: ["content"],
    });

    // 찜한 콘텐츠 ID 목록
    const wishedContentIds = new Set(
      wishlists.map((wishlist) => wishlist.content.id)
    );

    // 콘텐츠에 찜 상태 정보 추가
    return contents.map(
      (content: {
        id: number;
        title: string;
        thumbnail_url: string;
        release_year: number;
      }) => ({
        ...content,
        is_wished: wishedContentIds.has(content.id),
      })
    );
  }

  /**
   * 제목 기반으로 콘텐츠를 검색합니다.
   * 로그인 상태인 경우 사용자의 찜 목록 정보를 포함합니다.
   *
   * @param searchQuery 검색어
   * @param userId 로그인한 사용자의 ID (옵션)
   * @returns 검색된 콘텐츠 목록
   */
  async searchContents(
    searchQuery: string,
    userId?: number
  ): Promise<ContentSearchResponseDTO[]> {
    const contentRepository = getRepository(Content);

    // 제목 기반 검색 조회
    const contents = await contentRepository.find({
      select: ["id", "title", "thumbnail_url", "release_year"],
      where: {
        title: Like(`%${searchQuery}%`),
      },
    });

    // 비로그인 상태인 경우 기본 정보만 반환
    if (!userId) {
      return contents.map((content) => ({
        id: content.id,
        title: content.title,
        thumbnail_url: content.thumbnail_url,
        release_year: content.release_year,
      }));
    }

    // 로그인 상태인 경우 찜 목록 정보 추가
    const wishlistRepository = getRepository(Wishlist);
    const wishlists = await wishlistRepository.find({
      where: { user: { id: userId } },
      relations: ["content"],
    });

    // 찜한 콘텐츠 ID 목록
    const wishedContentIds = new Set(
      wishlists.map((wishlist) => wishlist.content.id)
    );

    // 콘텐츠에 찜 상태 정보 추가
    return contents.map((content) => ({
      id: content.id,
      title: content.title,
      thumbnail_url: content.thumbnail_url,
      release_year: content.release_year,
      is_wished: wishedContentIds.has(content.id),
    }));
  }

  /**
   * 콘텐츠 상세 정보를 조회합니다.
   * 로그인 상태인 경우 사용자의 찜 목록 정보와 시청 기록을 포함합니다.
   *
   * @param contentId 콘텐츠 ID
   * @param userId 로그인한 사용자의 ID (옵션)
   * @returns 콘텐츠 상세 정보
   */
  async getContentDetail(
    contentId: number,
    userId?: number
  ): Promise<ContentDetailResponseDTO> {
    const contentRepository = getRepository(Content);
    const entityManager = getManager();

    // 콘텐츠 기본 정보 조회
    const content = await contentRepository.findOne({
      where: { id: contentId },
    });

    if (!content) {
      throw new Error("존재하지 않는 콘텐츠입니다.");
    }

    // 콘텐츠의 장르 정보 조회
    const genres = await entityManager.query(
      `
      SELECT g.id, g.name, g.description
      FROM genres g
      JOIN content_genres cg ON g.id = cg.genre_id
      WHERE cg.content_id = ?
    `,
      [contentId]
    );

    // 기본 응답 객체 생성
    const response: ContentDetailResponseDTO = {
      id: content.id,
      title: content.title,
      description: content.description,
      thumbnail_url: content.thumbnail_url,
      video_url: content.video_url,
      duration: content.duration,
      release_year: content.release_year,
      genres: genres.map((genre: any) => ({
        id: genre.id,
        name: genre.name,
        description: genre.description,
      })),
    };

    // 비로그인 상태인 경우 기본 정보만 반환
    if (!userId) {
      return response;
    }

    // 로그인 상태인 경우 찜 목록 정보 추가
    const wishlistRepository = getRepository(Wishlist);
    const wishlist = await wishlistRepository.findOne({
      where: {
        user: { id: userId },
        content: { id: contentId },
      },
    });

    response.is_wished = !!wishlist;

    // 시청 기록 조회
    const viewingHistoryRepository = getRepository(ViewingHistory);
    const viewingHistory = await viewingHistoryRepository.findOne({
      where: {
        user: { id: userId },
        content: { id: contentId },
      },
      order: { watched_at: "DESC" },
    });

    if (viewingHistory) {
      response.last_position = viewingHistory.last_position;
    }

    return response;
  }

  /**
   * 콘텐츠 스트리밍 정보를 조회합니다.
   * 로그인한 사용자의 이전 시청 위치를 포함합니다.
   *
   * @param contentId 콘텐츠 ID
   * @param userId 사용자 ID
   * @returns 스트리밍 URL과 마지막 시청 위치
   */
  async getStreamingInfo(
    contentId: number,
    userId: number
  ): Promise<StreamingInfoResponse> {
    const contentRepository = getRepository(Content);
    const viewingHistoryRepository = getRepository(ViewingHistory);

    // 콘텐츠 정보 조회
    const content = await contentRepository.findOne({
      where: { id: contentId },
    });

    if (!content) {
      throw new Error("존재하지 않는 콘텐츠입니다.");
    }

    // 사용자의 이전 시청 기록 조회
    const viewingHistory = await viewingHistoryRepository.findOne({
      where: {
        user: { id: userId },
        content: { id: contentId },
      },
      order: { watched_at: "DESC" },
    });

    // 스트리밍 정보 반환 (시청 기록이 없으면 0초부터 시작)
    return {
      streaming_url: content.video_url,
      last_position: viewingHistory ? viewingHistory.last_position : 0,
    };
  }

  /**
   * 콘텐츠 재생 위치를 업데이트합니다.
   *
   * @param contentId 콘텐츠 ID
   * @param userId 사용자 ID
   * @param currentPosition 현재 재생 위치(초)
   */
  async updatePlaybackPosition(
    contentId: number,
    userId: number,
    currentPosition: number
  ): Promise<void> {
    const contentRepository = getRepository(Content);
    const viewingHistoryRepository = getRepository(ViewingHistory);

    // 콘텐츠 확인
    const content = await contentRepository.findOne({
      where: { id: contentId },
    });

    if (!content) {
      throw new Error("존재하지 않는 콘텐츠입니다.");
    }

    // 기존 시청 기록 조회
    let viewingHistory = await viewingHistoryRepository.findOne({
      where: {
        user: { id: userId },
        content: { id: contentId },
      },
    });

    // 시청 기록이 없으면 새로 생성
    if (!viewingHistory) {
      viewingHistory = new ViewingHistory();
      viewingHistory.user = { id: userId } as any;
      viewingHistory.content = { id: contentId } as any;
      viewingHistory.watch_duration = 0;
      viewingHistory.is_completed = false;
    }

    // 마지막 재생 위치 업데이트
    viewingHistory.last_position = currentPosition;

    // 저장
    await viewingHistoryRepository.save(viewingHistory);
  }

  /**
   * 콘텐츠 재생 완료 시 최종 정보를 업데이트합니다.
   *
   * @param contentId 콘텐츠 ID
   * @param userId 사용자 ID
   * @param finalPosition 최종 재생 위치(초)
   * @param watchDuration 시청 시간(초)
   * @param isCompleted 시청 완료 여부
   */
  async updateFinalPlaybackInfo(
    contentId: number,
    userId: number,
    finalPosition: number,
    watchDuration: number,
    isCompleted: boolean
  ): Promise<void> {
    const contentRepository = getRepository(Content);
    const viewingHistoryRepository = getRepository(ViewingHistory);

    // 콘텐츠 확인
    const content = await contentRepository.findOne({
      where: { id: contentId },
    });

    if (!content) {
      throw new Error("존재하지 않는 콘텐츠입니다.");
    }

    // 기존 시청 기록 조회
    let viewingHistory = await viewingHistoryRepository.findOne({
      where: {
        user: { id: userId },
        content: { id: contentId },
      },
    });

    // 시청 기록이 없으면 새로 생성
    if (!viewingHistory) {
      viewingHistory = new ViewingHistory();
      viewingHistory.user = { id: userId } as any;
      viewingHistory.content = { id: contentId } as any;
    }

    // 정보 업데이트
    viewingHistory.last_position = finalPosition;
    viewingHistory.watch_duration = watchDuration;
    viewingHistory.is_completed = isCompleted;

    // 저장
    await viewingHistoryRepository.save(viewingHistory);
  }

  /**
   * 콘텐츠 찜하기 상태를 토글합니다. 이미 찜한 경우 취소하고, 찜하지 않은 경우 찜합니다.
   *
   * @param contentId 콘텐츠 ID
   * @param userId 사용자 ID
   * @returns 토글 후 찜하기 상태 (true: 찜한 상태, false: 찜하지 않은 상태)
   */
  async toggleWishlist(
    contentId: number,
    userId: number
  ): Promise<{ is_wished: boolean }> {
    const contentRepository = getRepository(Content);
    const wishlistRepository = getRepository(Wishlist);

    // 콘텐츠 확인
    const content = await contentRepository.findOne({
      where: { id: contentId },
    });

    if (!content) {
      throw new Error("존재하지 않는 콘텐츠입니다.");
    }

    // 현재 찜 상태 확인
    const wishlist = await wishlistRepository.findOne({
      where: {
        user: { id: userId },
        content: { id: contentId },
      },
    });

    // 이미 찜한 경우 찜 취소
    if (wishlist) {
      await wishlistRepository.remove(wishlist);
      return { is_wished: false };
    }

    // 찜하지 않은 경우 찜하기
    const newWishlist = new Wishlist();
    newWishlist.user = { id: userId } as any;
    newWishlist.content = { id: contentId } as any;

    await wishlistRepository.save(newWishlist);
    return { is_wished: true };
  }
}
