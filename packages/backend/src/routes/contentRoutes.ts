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

export default router;
