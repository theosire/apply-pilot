import mongoose from "mongoose";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { createApplicationForUser, deleteApplicationById, getApplicationById, getApplicationsByUser, updateApplicationById } from "../services/applications.service";

export const listApplications = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const applications = await getApplicationsByUser(userId);

    res.json({ applications });
};

export const createApplication = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const applicationReq = req.body;

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const application = await createApplicationForUser(userId, applicationReq);

    res.status(201).json({ 
        application,
        message: "Application successfully created" 
    });
};

export const getApplication = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const applicationId = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        return res.status(400).json({ message: "Invalid application ID" });
    }

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const application = await getApplicationById(userId, applicationId);

    if (!application) {
        return res.status(404).json({ message: "Application not found." });
    }

    res.json({ application });
};

export const editApplication = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const applicationId = req.params.id as string;
    const updatedApplicationReq = req.body;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        return res.status(400).json({ message: "Invalid application ID" });
    }

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const application = await updateApplicationById(userId, applicationId, updatedApplicationReq);

    if (!application) {
        return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ 
        application,
        message: "Application successfully edited." 
    });
};

export const removeApplication = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const applicationId = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        return res.status(400).json({ message: "Invalid application ID" });
    }

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const application = await deleteApplicationById(userId, applicationId);

    if (!application) {
        return res.status(404).json({ message: "Application not found." });
    }

    res.json({ message: "Application deleted successfully" });
};
