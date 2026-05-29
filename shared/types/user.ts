// Keep in sync with User.model.ts

export interface User {
    _id: string;
    name: string;
    email: string;
    resumeText?: string;
    weeklyGoal: number;
    timezone: string,
    createdAt: string;
    updatedAt: string;
    background: UserBackground;
}

export interface UserBackground {
    currentTitle: string;
    yearsExperience: number;
    skills: string[];
    bio: string;
    targetRole: string;
    targetSalary: number | null;
}