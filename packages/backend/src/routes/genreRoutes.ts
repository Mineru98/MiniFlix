import express from "express";
import { GenreController } from "../controllers/GenreController";

const router = express.Router();
const genreController = new GenreController();

// 모든 장르 목록 조회
router.get("/", genreController.getGenres.bind(genreController));

export default router;
