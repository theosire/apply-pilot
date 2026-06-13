import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../lib/axios";

type AddApplicationModalProps ={
  onClose: () => void;
};

export const AddApplicationModal = ({ onClose}: AddApplicationModalProps) => {
  const queryClient = useQueryClient();

  const [companyName, setCompanyName] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [role, setRole] = useState("");
  const [workType, setWorkType] = useState("remote");
  const [status, setStatus] = useState("Saved");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [notes, setNotes] = useState("");

  // Create a new application, then refetch the board so the card appears immediately
  const createApplication = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/applications", {
        companyName,
        companyDomain,
        role,
        workType,
        status,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        jobDescription,
        notes,
      });

      return res.data.application;
    },
    onSuccess: () => {
      toast.success("Application added");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to add application");
    },
  });

  const handleSubmit = async (e: any) => {
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

    await createApplication.mutateAsync();
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-lg"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">
          <h2 className="text-xl font-semibold">Add Application</h2>

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
          <input 
            className="w-full rounded border p-2" 
            placeholder="Company" 
            value={companyName} 
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <input 
            className="w-full rounded border p-2" 
            placeholder="Company domain" 
            value={companyDomain} 
            onChange={(e) => setCompanyDomain(e.target.value)} 
          />
          <input 
            className="w-full rounded border p-2" 
            placeholder="Role" 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
          />

          <select 
            className="w-full rounded border p-2" 
            value={workType} 
            onChange={(e) => setWorkType(e.target.value)}
          >
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>

          <select 
            className="w-full rounded border p-2" 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Saved</option>
            <option>Applied</option>
            <option>Phone Screen</option>
            <option>Technical Interview</option>
            <option>Final Round</option>
            <option>Offer</option>
            <option>Rejected / Closed</option>
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input 
              className="rounded border p-2" 
              type="number"
              min="0"
              placeholder="Salary min" 
              value={salaryMin} 
              onChange={(e) => setSalaryMin(e.target.value)} 
            />
            <input 
              className="rounded border p-2" 
              type="number"
              min="0"
              placeholder="Salary max" 
              value={salaryMax} 
              onChange={(e) => setSalaryMax(e.target.value)} 
            />
          </div>

          <textarea 
            className="min-h-40 w-full resize-y rounded border p-3" 
            placeholder="Paste the full job description here. This will be saved as a permanent snapshot." 
            value={jobDescription} 
            onChange={(e) => setJobDescription(e.target.value)} 
          />

          <textarea 
            className="min-h-20 w-full rounded border p-2" 
            placeholder="Notes" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
          />
        </div>

        {/* Keep the save active visible while scrolling through long job descriptions */}
        <div className="sticky bottom-0 border-t bg-white p-6">
          <button 
            type="submit"
            disabled={createApplication.isPending}
            className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {createApplication.isPending ? "Adding..." : "Add application"}
          </button>
        </div>
      </form>
    </div>
  );
};