import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Application } from "../../../../shared/types/application";
import { api } from "../../lib/axios";
import { MatchScorePanel } from "../ai/MatchScorePanel";

type ApplicationDetailModalProps = {
  application: Application;
  onClose: () => void;
};

export const ApplicationDetailModal = ({
  application,
  onClose,
}: ApplicationDetailModalProps) => {
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState(application.notes || "");
  const [followUpDate, setFollowUpDate] = useState(
    application.followUpDate ? application.followUpDate.split("T")[0] : ""
  );

  const updateApplication = useMutation({
    mutationFn: async (data: Partial<Application>) => {
      const res = await api.patch(`/api/applications/${application._id}`, data);
      return res.data.application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application updated");
    },
    onError: () => {
      toast.error("Failed to update application");
    },
  });

  // Delete the application, refresh the board and close the modal
  const deleteApplication = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/applications/${application._id}`);
    },
    onSuccess: () => {
      toast.success("Application deleted");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to delete application");
    },
  });

  // Close the modal when the user presses Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

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
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-lg">
        {/* Keep the header visible while scrolling through long application details */}
        <div className="sticky top-0 z-10 border-b bg-white p-6">
          <div className="flex items-start justify-between gap-4 rounded-lg bg-gray-50 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-500">
                {application.companyName}
              </p>
              <h2 className="truncate text-2xl font-semibold">
                {application.role}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-2 text-xl text-gray-500 hover:bg-gray-200"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main scrollable modal body */}
        <div className="space-y-6 overflow-y-auto p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Work type" value={application.workType} />
            <DetailItem label="Status" value={application.status} />
            <DetailItem label="Salary" value={salaryRange} />
            <DetailItem
              label="Date applied"
              value={
                application.dateApplied
                  ? new Date(application.dateApplied).toLocaleDateString()
                  : "Not provided"
              }
            />
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Job posting</h3>
            {application.url ? (
              <a
                href={application.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                View posting
              </a>
            ) : (
              <p className="text-sm text-gray-500">Not provided</p>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-semibold">
              Saved job description snapshot
            </h3>
            <p className="whitespace-pre-wrap rounded border bg-gray-50 p-3 text-sm text-gray-700">
              {application.jobDescription || "No job description saved."}
            </p>
          </div>

          <MatchScorePanel applicationId={application._id} />

          <div>
            <label className="mb-1 block font-semibold">Notes</label>
            <textarea
              className="min-h-24 w-full rounded border p-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            <label className="mb-1 block font-semibold">Follow-up date</label>
            <input
              type="date"
              className="rounded border p-2 text-sm"
              value={followUpDate}
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
              <p className="text-sm text-gray-500">No activity yet.</p>
            ) : (
              <ol className="space-y-2">
                {activityLog.map((item) => (
                  <li
                    key={item._id || item.timestamp}
                    className="border-l-2 pl-3 text-sm"
                  >
                    <p>{item.action}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="flex gap-3 border-t pt-4">
            <button
              type="button"
              className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
            >
              Edit
            </button>

            <button
              type="button"
              disabled={deleteApplication.isPending}
              onClick={() => deleteApplication.mutate()}
              className="rounded border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleteApplication.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="rounded border bg-gray-50 p-3">
    <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
    <div className="mt-1 text-sm text-gray-900">{value}</div>
  </div>
);