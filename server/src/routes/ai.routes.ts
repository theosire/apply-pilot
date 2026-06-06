// Defines API routes for user authentication
import express from "express";
import { protect } from "../middleware/auth.middleware";
import { generateCoverLetter } from "../controllers/ai.controller";

const aiRouter = express.Router();

aiRouter.post("/cover-letter", protect, generateCoverLetter);

export default aiRouter;