import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../lib/axios";
import type { Application } from "../../../../shared/types/application";

type ApplicationFormModalProps ={
  application?: Application;
  onClose: () => void;
  onSaved?: (application: Application) => void;
};

type WorkType = "remote" | "hybrid" | "onsite";

type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Phone Screen"
  | "Technical Interview"
  | "Final Round"
  | "Offer"
  | "Rejected / Closed";

type EntryMode = "manual" | "ai";

export const ApplicationFormModal = ({ 
  application,
  onClose,
  onSaved,
}: ApplicationFormModalProps) => {
  const queryClient = useQueryClient();
  const isEditing = Boolean(application);

  const [entryMode, setEntryMode] = useState<EntryMode>("manual");
  const [rawJobText, setRawJobText] = useState("");
  const [isAutofilling, setIsAutofilling] = useState(false);

  const [companyName, setCompanyName] = useState(application?.companyName || "");
  const [companyDomain, setCompanyDomain] = useState(application?.companyDomain || "");
  const [url, setUrl] = useState(application?.url || "");
  const [role, setRole] = useState(application?.role || "");
  const [workType, setWorkType] = useState<WorkType>(
    application?.workType || "remote"
  );
  const [status, setStatus] = useState<ApplicationStatus>(
    application?.status || "Applied"
  );
  const [salaryMin, setSalaryMin] = useState(
    application?.salaryMin ? String(application.salaryMin): ""
  );
  const [salaryMax, setSalaryMax] = useState(
    application?.salaryMax ? String(application.salaryMax): ""
  );
  const [jobDescription, setJobDescription] = useState(application?.jobDescription || "");
  const [notes, setNotes] = useState(application?.notes || "");

  // Use AI to extract application fields from a pasted job posting
  const handleAutofill = async () => {
    if (!rawJobText.trim()) {
      toast.error("Paste a job posting first");
      return;
    }

    try {
      setIsAutofilling(true);

      const res = await api.post("/api/ai/autofill-application", {
        jobText: rawJobText,
      });

      const details = res.data.applicationDetails;

      setCompanyName(details.companyName || "");
      setCompanyDomain(details.companyDomain || details.companyWebsite || "");
      setUrl(details.url || "");
      setRole(details.role || "");
      setWorkType((details.workType as WorkType) || "remote");
      setSalaryMin(details.salaryMin ? String(details.salaryMin) : "");
      setSalaryMax(details.salaryMax ? String(details.salaryMax) : "");
      setJobDescription(rawJobText);

      toast.success("Application details autofilled");
      setEntryMode("manual");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Could not autofill application details"
      );
    } finally {
      setIsAutofilling(false);
    }
  };

  const saveApplication = useMutation({
    mutationFn: async () => {
      const payload = {
        companyName,
        companyDomain,
        url,
        role,
        workType,
        status,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        jobDescription,
        notes,
      };

      if (isEditing && application) {
        const res = await api.patch(
          `/api/applications/${application._id}`, 
          payload
        );
        return res.data.application;
      }

      const res = await api.post("/api/applications", payload)
      return res.data.application;
    },
    onSuccess: (savedApplication) => {
      toast.success(isEditing ? "Application updated" : "Application added");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      onSaved?.(savedApplication);
      onClose();
    },
    onError: () => {
      toast.error(
        isEditing ? "Failed to update application" : "Failed to add application"
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const salaryMinNumber = salaryMin ? Number(salaryMin) : null;
    const salaryMaxNumber = salaryMax ? Number(salaryMax) : null;

    if (salaryMin && Number.isNaN(salaryMinNumber)) {
      toast.error("Salary min must be a number");
      return;
    }

    if (salaryMax && Number.isNaN(salaryMaxNumber)) {
      toast.error("Salary max must be a number");
      return;
    }

    await saveApplication.mutateAsync();
  };

  // Close the modal when the user presses Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-lg"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Application" : "Add Application"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-xl hover:bg-gray-100"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-6">
          {/* Let users either fill fields manually or paste a job post for AI autofill */}
          {!isEditing && (
            <div className="flex rounded-lg border bg-gray-200 p-1">
              <button
                type="button"
                onClick={() => setEntryMode("ai")}
                className={`w-full rounded px-3 py-2 text-sm font-medium transition ${
                  entryMode === "ai" 
                    ? "bg-black text-white shadow-sm" 
                    : "text-gray-700 hover:bg-gray-300"
                }`}
              >Autofill from job post</button>

              <button
                type="button"
                onClick={() => setEntryMode("manual")}
                className={`w-full rounded px-3 py-2 text-sm font-medium transition ${
                  entryMode === "manual" 
                    ? "bg-black text-white shadow-sm" 
                    : "text-gray-700 hover:bg-gray-300"
                }`}
              >Manual entry</button>
            </div>
          )}

          {entryMode === "ai" && !isEditing && (
            <div className="rounded border bg-gray-50 p-4">
              <label className="mb-1 block text-sm font-medium">
                Paste full job posting
              </label>

              <textarea 
                className="min-h-48 w-full rounded border bg-white p-3"
                placeholder="Paste the full job description here..."
                value={rawJobText}
                onChange={(e) => setRawJobText(e.target.value)}
              />

              <button
                type="button"
                disabled={isAutofilling || !rawJobText.trim()}
                onClick={handleAutofill}
                className="mt-3 rounded bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAutofilling ? "Autofilling..." : "Autofill details"}
              </button>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Company</label>
            <input
              required
              className="w-full rounded border p-2"
              placeholder="Company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Company website</label>
            <input
              className="w-full rounded border p-2"
              placeholder="https://company.com"
              value={companyDomain}
              onChange={(e) => setCompanyDomain(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Role</label>
            <input
              required
              className="w-full rounded border p-2"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Work type</label>
            <select
              className="w-full rounded border p-2"
              value={workType}
              onChange={(e) => setWorkType(e.target.value as WorkType)}
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select
              className="w-full rounded border p-2"
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
            >
              <option>Saved</option>
              <option>Applied</option>
              <option>Phone Screen</option>
              <option>Technical Interview</option>
              <option>Final Round</option>
              <option>Offer</option>
              <option>Rejected / Closed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Salary min</label>
              <input
                className="rounded border p-2"
                type="number"
                min="0"
                placeholder="Salary min"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Salary max</label>
              <input
                className="rounded border p-2"
                type="number"
                min="0"
                placeholder="Salary max"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Job posting URL</label>
            <input
              className="w-full rounded border p-2"
              placeholder="https://company.com/jobs/software-engineer"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Job description</label>
            <textarea
              className="min-h-40 w-full resize-y rounded border p-3"
              placeholder="Paste the full job description here."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea
              className="min-h-20 w-full rounded border p-2"
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="sticky bottom-0 border-t bg-white p-6">
          <button
            type="submit"
            disabled={saveApplication.isPending}
            className="w-full rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveApplication.isPending
              ? isEditing
                ? "Saving..."
                : "Adding..."
              : isEditing
                ? "Save changes"
                : "Add application"}
          </button>
        </div>
      </form>
    </div>
  );
};