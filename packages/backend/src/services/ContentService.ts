import { getManager, getRepository } from "typeorm";
import { Content, ContentListResponseDTO } from "../models/Content";
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
}
