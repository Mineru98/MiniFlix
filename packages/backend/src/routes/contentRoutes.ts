import express from "express";
import { ContentController } from "../controllers/ContentController";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();
const contentController = new ContentController();

// 모든 콘텐츠 목록 조회 (선택적 인증)
router.get(
  "/",
  authenticate({ required: false }),
  contentController.getContents.bind(contentController)
);

// 장르별 콘텐츠 목록 조회 (선택적 인증)
router.get(
  "/genre/:genreId",
  authenticate({ required: false }),
  contentController.getContentsByGenre.bind(contentController)
);

// 검색어로 콘텐츠 검색 (선택적 인증)
router.get(
  "/search",
  authenticate({ required: false }),
  contentController.searchContents.bind(contentController)
);

// 콘텐츠 상세 정보 조회 (선택적 인증)
router.get(
  "/:id",
  authenticate({ required: false }),
  contentController.getContentDetail.bind(contentController)
);

// 스트리밍 정보 조회 (로그인 필수)
router.get(
  "/:id/stream",
  authenticate({ required: true }),
  contentController.getStreamingInfo.bind(contentController)
);

// 재생 위치 업데이트 (로그인 필수)
router.post(
  "/playback/position",
  authenticate({ required: true }),
  contentController.updatePlaybackPosition.bind(contentController)
);

// 최종 재생 정보 업데이트 (로그인 필수)
router.post(
  "/playback/final",
  authenticate({ required: true }),
  contentController.updateFinalPlaybackInfo.bind(contentController)
);

// 콘텐츠 찜하기/취소 (로그인 필수)
router.post(
  "/:contentId/wishlist",
  authenticate({ required: true }),
  contentController.toggleWishlist.bind(contentController)
);

export default router;
