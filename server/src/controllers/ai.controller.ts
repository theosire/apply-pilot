import { Response } from "express";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";
import config from "../config/config";
import { AuthRequest } from "../middleware/auth.middleware";
import { User } from "../models/User.model";
import { getApplicationById } from "../services/applications.service";

const ai = new GoogleGenAI({
    apiKey: config.geminiApiKey,
});

export const generateCoverLetter = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const { applicationId, tone = "Professional" } = req.body;

    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
        return res.status(400).json({ message: "Invalid application ID" });
    }

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const application = await getApplicationById(userId, applicationId);

    if (!application) {
        return res.status(404).json({ message: "Application not found." });
    }

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const background = user.background
        ? `
            Current title: ${user.background.currentTitle}
            Years experience: ${user.background.yearsExperience}
            Skills: ${user.background.skills.join(", ")}
            Bio: ${user.background.bio}
            Target role: ${user.background.targetRole}
            Target salary: ${user.background.targetSalary}
          ` 
        : "No background profile provided.";

        const prompt = `
            Write a ${tone.toLowerCase()} cover letter for this job application.

            Company: ${application.companyName}
            Role: ${application.role}
            Work type: ${application.workType}
            Job description:
            ${application.jobDescription || "No job description provided."}

            Candidate background:
            ${background}

            Requirements:
            - 3 short paragraphs
            - under 300 words
            - specific to the company and role
            - do not start with "I am writing to express my interest"
            - professional and direct
        `;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        try {
            const stream = await ai.models.generateContentStream({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            for await (const chunk of stream) {
                const text = chunk.text;

                if (text) {
                    res.write(`data: ${JSON.stringify({ text })}\n\n`);
                }
            }

            res.write("data: [DONE]\n\n");
            res.end();
        } catch (error) {
            console.error("Cover letter generation failed:", error);
            res.write(`data: ${JSON.stringify({ error: "Failed to generate cover letter" })}\n\n`);
            res.write("data: [DONE]\n\n");
            res.end();
        }
};
