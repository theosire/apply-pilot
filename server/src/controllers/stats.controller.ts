// Handles stats HTTP requests and delegates calculation logic to stats services.
import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { calculateApplicationFunnel, calculateApplicationSummary, calculateWeeklyApplicationTimeline } from "../services/stats.service";

export const getApplicationFunnelStats = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    
    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const funnel = await calculateApplicationFunnel(userId);

    res.json({ funnel });
}

export const getApplicationSummaryStats = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    
    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const summary = await calculateApplicationSummary(userId);

    res.json({ summary });
}

export const getWeeklyApplicationTimeline = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    
    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const timeline = await calculateWeeklyApplicationTimeline(userId);

    res.json({ timeline });
}
