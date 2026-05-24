// Contains application database CRUD operations used by the controller

import { DateTime } from "luxon";
import { Application } from "../models/Application.model";
import { User } from "../models/User.model";

export const getApplicationsByUser = async (userId: string) => {
    return Application.find({ userId }).sort({
        status: 1,
        columnOrder: 1,
    });
};

export const createApplicationForUser = async (
    userId: string, 
    data: Record<string, unknown>
) => {

    const followUpDate = await normalizeFollowUpDate(userId, data);

    return Application.create({ 
        ...data,
        ...(data.followUpDate ? { followUpDate } : {}),
        userId,
        activityLog: [
            {
                action: "Application created",
                timestamp: new Date(),
            },
        ],
    });
};

export const getApplicationById = async (userId: string, applicationId: string) => {
    return Application.findOne({ 
        _id: applicationId, 
        userId,
    });
};

export const updateApplicationById = async (
    userId: string,
    applicationId: string,
    data: Record<string, unknown>
) => {
    const followUpDate = await normalizeFollowUpDate(userId, data);

    return Application.findOneAndUpdate(
        {
            _id: applicationId,
            userId,
        },
        {
            ...data,
            ...(data.followUpDate ? { followUpDate } : {}),
            // Add an activity log entry whenever the application is updated
            $push: {
                activityLog: {
                    action: "Application edited",
                    timestamp: new Date(),
                },
            },
        },
        {
            new: true,
            runValidators: true,
        },
    );
};

export const moveApplicationById = async (
    userId: string,
    applicationId: string,
    status: string,
    columnOrder: number
) => {
    const oldApplication = await Application.findOne({
        _id: applicationId,
        userId,
    });

    if (!oldApplication) {
        return null
    }

    const update: Record<string, unknown> = {
        status,
        columnOrder,
    };

    // Only record timeline activity when the card moves to a different status
    if (oldApplication.status !== status) {
        update.$push = {
            activityLog: {
                action: `Moved to ${status}`,
                timestamp: new Date(),
            }
        };
    }

    return Application.findOneAndUpdate(
        {
            _id: applicationId,
            userId,
        },
        update,
        {
            new: true,
            runValidators: true,
        },
    );
};

export const deleteApplicationById = async (userId: string, applicationId: string) => {
    return Application.findOneAndDelete({ 
        _id: applicationId, 
        userId,
    });
};

export const getApplicationByFollowUpDate = async (userId: string, startTime: Date, endTime: Date) => {
    return Application.find({
        userId,
        followUpDate: {
            $gte: startTime,
            $lte: endTime,
        },
    });
};

// Convert the follow up date from user timezone to UTC (normalized)
const normalizeFollowUpDate = async (
    userId: string, 
    data: Record<string, unknown>
) => {
    const user = await User.findById(userId);

    if (!data.followUpDate) {
        return undefined;
    }

    return DateTime.fromISO(data.followUpDate as string, {
        zone: user?.timezone || "America/Toronto",
    }).startOf("day").toJSDate();
};