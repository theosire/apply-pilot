// Defines API routes for user authentication
import express from "express";
import { protect } from "../middleware/auth.middleware";
import { generateCoverLetter, generateMatchScore } from "../controllers/ai.controller";

const aiRouter = express.Router();

aiRouter.post("/cover-letter", protect, generateCoverLetter);
aiRouter.post("/match-score", protect, generateMatchScore);

export default aiRouter;