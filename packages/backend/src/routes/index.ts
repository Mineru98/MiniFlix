import express from "express";
import contentRoutes from "./contentRoutes";
import genreRoutes from "./genreRoutes";

const router = express.Router();

router.use("/contents", contentRoutes);
router.use("/genres", genreRoutes);

// API 상태 확인 엔드포인트
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "API is running" });
});

export default router;
