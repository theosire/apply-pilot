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

interface MatchScore {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    seniorityMatch: string;
    summary: string;
}

const validateMatchScore = (data: any): MatchScore | null => {
    if (!data || typeof data !== "object") return null;

    const isStringArray = (arr: any) =>
        Array.isArray(arr) && arr.every((item) => typeof item === "string");

    if (typeof data.score !== "number" || data.score < 0 || data.score > 100) return null;
    if (!isStringArray(data.matchedSkills)) return null;
    if (!isStringArray(data.missingSkills)) return null;
    if (typeof data.seniorityMatch !== "string") return null;
    if (typeof data.summary !== "string") return null;

    return {
        score: Math.round(data.score),
        matchedSkills: data.matchedSkills,
        missingSkills: data.missingSkills,
        seniorityMatch: data.seniorityMatch,
        summary: data.summary,
    };
};

const getAiErrorMessage = (error: any) => {
    if (error?.status === 429) {
        return "AI rate limit reached. Please wait a few seconds and try again.";
    }

    if (error?.status === 503) {
        return "AI service is busy right now. Please try again later.";
    }

    return "AI request failed.";
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

        Job Description:
        ${application.jobDescription}

        Role:
        ${application.role}

        Company:
        ${application.companyName}

        Candidate Profile:
        ${background}

        Rules:
        - Do not invent skills, tools, frameworks, certifications, or requirements.
        - Only use technologies and requirements explicitly found in the job description.
        - matchedSkills should only include skills from the candidate profile that also appear in the job description.
        - missingSkills should only include important requirements from the job description that are not clearly present in the candidate profile.
        - If the job description is unclear, too short, or does not contain real job requirements, return score 0 with empty arrays.
        - Score must be a number from 0 to 100.
    `;

    const responseSchema = {
        type: "object",
        properties: {
            score: { type: "number" },
            matchedSkills: { type: "array", items: { type: "string" } },
            missingSkills: { type: "array", items: { type: "string" } },
            seniorityMatch: { type: "string" },
            summary: { type: "string" },
        },
        required: ["score", "matchedSkills", "missingSkills", "seniorityMatch", "summary"],
    };

    try {
        let matchScore: MatchScore | null = null;

        for (let attempt = 0; attempt < 2; attempt++) {
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    temperature: 0.1,
                    responseMimeType: "application/json",
                    responseSchema,
                },
            });

            const cleanedText = (result.text || "")
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            let parsed: any;
            try {
                parsed = JSON.parse(cleanedText);
            } catch {
                continue;
            }

            matchScore = validateMatchScore(parsed);
            if (matchScore) break;
        }

        if (!matchScore) {
            return res.status(502).json({
                message: "Could not generate a reliable match score. Please try again.",
            });
        }

        res.json({ matchScore });
    } catch (error: any) {
        console.error("Match score generation failed:", error);

        const statusCode = error?.status === 429 ? 429 : 500;

        res.status(statusCode).json({
            message: getAiErrorMessage(error),
        });
    }
};