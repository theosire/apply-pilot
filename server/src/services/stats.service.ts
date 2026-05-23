// Contains database queries and calculations for application dashboard stats.
import mongoose from 'mongoose';
import { Application } from "../models/Application.model";

export const calculateApplicationFunnel = async (userId: string) => {
    const result = await Application.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Fixed Kanban order keeps funnel chart data consistent
    const statusOrder = [
        "Saved",
        "Applied",
        "Phone Screen",
        "Technical Interview",
        "Final Round",
        "Offer",
        "Rejected / Closed",
    ];

    return statusOrder.map((status) => {
        const found = result.find((item) => item._id === status);

        return {
            status,
            count: found?.count || 0,
        };
    });
};

export const calculateApplicationSummary = async (userId: string) => {
    const applications = await Application.find({ userId });

    const totalApplications = applications.length;

    const responseStatuses = [
        "Phone Screen",
        "Technical Interview",
        "Final Round",
        "Offer",
    ];

    const responseCount = applications.filter((app) =>
        responseStatuses.includes(app.status)
    ).length;

    const responseRate = 
        totalApplications === 0
            ? 0
            : Math.round((responseCount / totalApplications) * 100);
    
    const offerCount = applications.filter(
        (app) => app.status === "Offer"
    ).length;

    const applicationsWithSalary = applications.filter(
        (app) => app.salaryMin && app.salaryMax
    );
    let totalSalary = 0;
    applicationsWithSalary.forEach(app => {
        totalSalary += (((app.salaryMin ?? 0) + (app.salaryMax ?? 0)) /2)
    });

    const averageSalary =
        applicationsWithSalary.length === 0
            ? 0
            : Math.round(totalSalary / applicationsWithSalary.length);

    const summary = {
        totalApplications,
        responseRate,
        offerCount,
        averageSalary,
    };

    return summary;
}

export const calculateWeeklyApplicationTimeline = async (userId: string) => {
    const applications = await Application.find({ userId });

    const timeline: Record<string, number> = {};

    // Group applications by the start date of their created week
    for (const app of applications) {
        const date = new Date(app.createdAt);

        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay())

        const weekKey = weekStart.toISOString().split("T")[0];

        timeline[weekKey] = (timeline[weekKey] || 0) + 1;
    }

    return Object.entries(timeline).map(([week, count]) => ({
        week,
        count,
    }));
};