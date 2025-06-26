import express from "express";
import {
  createGame,
  getAllgames,
  getGameById,
  deleteGame,
  //updateGame,
  getRankingByJogoId,
  saveResult,
  // Assuming you have an updateGame function
} from "../controllers/gameControlls.js";
import authMiddleware from "../middlewares/authMiddlewares";

const router = express.Router();

router.post("/create", authMiddleware, createGame); // POST /games/criar
router.get("/all", authMiddleware, getAllgames); // GET /games/
router.get("/:id", authMiddleware, getGameById); // GET /games/:id
router.delete("/:id", authMiddleware, deleteGame); // DELETE /games/:id
//router.put("/:id", authMiddleware, updateGame); // PUT /games/:id (assuming you have an updateGame function)
router.get("/ranking/:jogoId", authMiddleware, getRankingByJogoId); // GET /games/ranking/:
router.post("/results", authMiddleware, saveResult); // POST /games/results
export default router;
