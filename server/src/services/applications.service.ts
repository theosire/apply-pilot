import { Application } from "../models/Application.model";

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
    return Application.create({ 
        ...data,
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
    return Application.findOneAndUpdate(
        {
            _id: applicationId,
            userId,
        },
        {
            ...data,

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
    return Application.findOneAndUpdate(
        {
            _id: applicationId,
            userId,
        },
        {
            status,
            columnOrder,
            // Add an activity log entry whenever the application is moved
            $push: {
                activityLog: {
                    action: `Moved to ${status}`,
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

export const deleteApplicationById = async (userId: string, applicationId: string) => {
    return Application.findOneAndDelete({ 
        _id: applicationId, 
        userId,
    });
};
