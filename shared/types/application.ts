// Keep in sync with Application.model.ts

export type ApplicationStatus = 
    | "Saved"
    | "Applied"
    | "Phone Screen"
    | "Technical Interview"
    | "Final Round"
    | "Offer"
    | "Rejected / Closed";

export type workType = "remote" | "hybrid" | "onsite";

export interface ActivityLogTerm {
    action: string;
    note?: string;
    timestamp: string;
}

export interface Application {
    _id: string;
    userId: string;
    companyName: string;
    companyDomain?: string
    role: string;
    url?: string;
    salaryMin?: number; 
    salaryMax?: number;
    location?: string;
    workType: workType;
    status: ApplicationStatus;
    columnOrder: number;
    jobDescription?: string;
    notes?: string;
    coverLetter?: string;
    followUpDate?: string | null;
    activityLog: ActivityLogTerm[];
    dateApplied?: string | null;
    createdAt: string;
    updatedAt: string;
}