import express from "express";
import contentRoutes from "./contentRoutes";

const router = express.Router();

router.use("/contents", contentRoutes);

// API 상태 확인 엔드포인트
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "API is running" });
});

export default router;
