// Defines API routes for user authentication
import express from "express";
import { protect } from "../middleware/auth.middleware";
import { generateMatchScore } from "../controllers/ai.controller";

const aiRouter = express.Router();

aiRouter.post("/match-score", protect, generateMatchScore);

export default aiRouter;