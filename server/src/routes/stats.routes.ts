// Defines protected stats API routes for dashboard analytics
import express from "express";
import { protect } from "../middleware/auth.middleware";
import { getApplicationFunnelStats, getApplicationSummaryStats, getWeeklyApplicationTimeline } from "../controllers/stats.controller";

const statsRouter = express.Router();

statsRouter.use(protect);

statsRouter.get("/funnel", getApplicationFunnelStats);
statsRouter.get("/summary", getApplicationSummaryStats);
statsRouter.get("/timeline", getWeeklyApplicationTimeline);

export default statsRouter;