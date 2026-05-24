// Keep in sync with User.model.ts

export interface User {
    _id: string;
    name: string;
    email: string;
    passwordHash: string;
    resumeText?: string;
    weeklyGoal: number;
    timezone: string,
    createdAt: string;
    updatedAt: string;
}