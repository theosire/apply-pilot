import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Application } from "../../../../shared/types/application";
import { api } from "../../lib/axios";
import { MatchScorePanel } from "../ai/MatchScorePanel";

type ApplicationDetailModalProps = {
    application: Application;
    onClose: () => void;
};

export const ApplicationDetailModal = ({
    application,
    onClose
}: ApplicationDetailModalProps) => {
    const queryClient = useQueryClient();

    const [notes, setNotes] = useState(application.notes || "");
    const [followUpDate, setFollowUpDate] = useState(
        application.followUpDate ? application.followUpDate.split("T")[0] : ""
    );

    // Update application fields and refetch the board after a successful save
    const updateApplication = useMutation({
        mutationFn: async (data: Partial<Application>) => {
            const res = await api.patch(`/api/applications/${application._id}`, data);
            return res.data.application;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
        },
    });

    const salaryRange = 
        application.salaryMin && application.salaryMax
            ? `$${application.salaryMin} - $${application.salaryMax}`
            : "Not provided";

    const activityLog = [...(application.activityLog || [])].sort(
        (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">{application.role}</h2>
                        <p className="text-gray-600">{application.companyName}</p>
                    </div>

                    <button onClick={onClose} className="text-gray-500">
                        ✕
                    </button>
                </div>

                <div className="space-y-4 text-sm">
                    <p>
                        <strong>Work type:</strong> {application.workType}
                    </p>

                    <p>
                        <strong>Status:</strong> {application.status}
                    </p>

                    <p>
                        <strong>Salary:</strong> {salaryRange}
                    </p>

                    <p>
                        <strong>Date applied:</strong>{" "}
                        {application.dateApplied
                            ? new Date(application.dateApplied).toLocaleDateString()
                            : "Not provided"}
                    </p>

                    <p>
                        <strong>Job URL:</strong>{" "}
                        {application.url ? (
                            <a
                                href={application.url}
                                target="_blank"
                                className="text-blue-600 underline"
                            >
                                View posting
                            </a>
                        ) : (
                            "Not provided"
                        )}
                    </p>

                    <div>
                        <strong>Saved job description snapshot:</strong>
                        <p className="mt-1 whitespace-pre-wrap rounded border bg-gray-50 p-3 text-gray-700">
                            {application.jobDescription || "No job description saved."}
                        </p>
                    </div>

                    <MatchScorePanel applicationId={application._id} />

                    <div>
                        <label className="mb-1 block font-semibold">Notes:</label>
                        <textarea
                            className="min-h-24 w-full rounded border p-2"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}

                            // Save notes when the user leaves the textarea
                            onBlur={async () => {
                                if (notes !== application.notes) {
                                    await updateApplication.mutateAsync({ notes });
                                }
                            }}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Notes save automatically when you leave the field.
                        </p>
                    </div>

                    <div>
                        <label className="mb-1 block font-semibold">Follow-up date:</label>
                        <input
                            type="date"
                            className="rounded border p-2"
                            value={followUpDate}

                            // Save follow-up date as soon as the user picks a new date
                            onChange={async (e) => {
                                const value = e.target.value;
                                setFollowUpDate(value);

                                await updateApplication.mutateAsync({
                                    followUpDate: value || null,
                                });
                            }}
                        />
                    </div>

                    <div>
                        <h3 className="mb-2 font-semibold">Activity log</h3>

                        {activityLog.length === 0 ? (
                            <p className="text-gray-500">No activity yet.</p>
                        ) : (
                            <ol className="space-y-2">
                                {activityLog.map((item) => (
                                    <li key={item._id || item.timestamp} className="border-l-2 pl-3">
                                        <p>{item.action}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};