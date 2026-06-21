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

export const ApplicationFormModal = ({ 
  application,
  onClose,
  onSaved,
}: ApplicationFormModalProps) => {
  type WorkType = "remote" | "hybrid" | "onsite";
  type ApplicationStatus =
    | "Saved"
    | "Applied"
    | "Phone Screen"
    | "Technical Interview"
    | "Final Round"
    | "Offer"
    | "Rejected / Closed";

  const queryClient = useQueryClient();
  const isEditing = Boolean(application);

  const [companyName, setCompanyName] = useState(application?.companyName || "");
  const [companyDomain, setCompanyDomain] = useState(application?.companyDomain || "");
  const [role, setRole] = useState(application?.role || "");
  const [workType, setWorkType] = useState<WorkType>(
    application?.workType || "remote"
  );
  const [status, setStatus] = useState<ApplicationStatus>(
    application?.status || "Saved"
  );
  const [salaryMin, setSalaryMin] = useState(
    application?.salaryMin ? String(application.salaryMin): ""
  );
  const [salaryMax, setSalaryMax] = useState(
    application?.salaryMax ? String(application.salaryMax): ""
  );
  const [url, setUrl] = useState(application?.url || "");
  const [jobDescription, setJobDescription] = useState(application?.jobDescription || "");
  const [notes, setNotes] = useState(application?.notes || "");


  const saveApplication = useMutation({
    mutationFn: async () => {
      const payload = {
        companyName,
        companyDomain,
        role,
        workType,
        status,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        url,
        jobDescription,
        notes,
      };

      if (isEditing && application) {
        const res = await api.patch(`/api/applications/${application._id}`, payload);
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
      toast.error(isEditing ? "Failed to update application" : "Failed to add application");
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
            className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
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