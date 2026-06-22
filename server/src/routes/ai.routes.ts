// AI endpoints for application analysis and autofill
import express from "express";
import { protect } from "../middleware/auth.middleware";
import { generateMatchScore, autofillApplication } from "../controllers/ai.controller";

const aiRouter = express.Router();

aiRouter.post("/match-score", protect, generateMatchScore);
aiRouter.post("/autofill-application", protect, autofillApplication);

export default aiRouter;