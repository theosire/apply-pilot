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

const isValidApplicationId = (applicationId: string) => {
    return applicationId && mongoose.Types.ObjectId.isValid(applicationId);
};

const getApplicationAndUser = async (userId: string, applicationId: string) => {
    const application = await getApplicationById(userId, applicationId);
    const user = await User.findById(userId);

    return { application, user };
};

const formatUserBackground = (user: any) => {
    return user.background
        ? `
            Current title: ${user.background.currentTitle}
            Years experience: ${user.background.yearsExperience}
            Skills: ${user.background.skills.join(", ")}
            Bio: ${user.background.bio}
            Target role: ${user.background.targetRole}
            Target salary: ${user.background.targetSalary}
        `
        : "No background profile provided.";
};

export const generateCoverLetter = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const { applicationId, tone = "Professional" } = req.body;

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    if (!isValidApplicationId(applicationId)) {
        return res.status(400).json({ message: "Invalid application ID" });
    }

    const { application, user } = await getApplicationAndUser(userId, applicationId);

    if (!application) {
        return res.status(404).json({ message: "Application not found." });
    }

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const background = formatUserBackground(user);

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

export const generateMatchScore = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const { applicationId } = req.body;

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    if (!isValidApplicationId(applicationId)) {
        return res.status(400).json({ message: "Invalid application ID" });
    }

    const { application, user } = await getApplicationAndUser(userId, applicationId);

    if (!application) {
        return res.status(404).json({ message: "Application not found." });
    }

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const background = formatUserBackground(user);

    const prompt = `
        Analyze this job description against the candidate profile.

        Return ONLY valid JSON. No markdown. No explanation.

        Job Description:
        ${application.jobDescription || "No job description provided."}

        Role:
        ${application.role}

        Company:
        ${application.companyName}

        Candidate Profile:
        ${background}

        Return this exact JSON structure:
        {
          "score": 78,
          "matchedSkills": ["React", "TypeScript", "Node.js"],
          "missingSkills": ["Docker", "AWS", "Jest"],
          "seniorityMatch": "Junior-friendly (0-2 years mentioned)",
          "summary": "Strong match on frontend skills, gaps in DevOps"
        }
        `;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const cleanedText = (result.text || "")
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const matchScore = JSON.parse(cleanedText);

        res.json({ matchScore });
    } catch (error) {
        console.error("Match score generation failed:", error);
        res.status(500).json({ message: "Failed to generate match score" });
    }
};