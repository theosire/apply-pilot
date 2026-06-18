import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/axios";
import type { Application } from '../../../shared/types/application';
import { KanbanBoard } from "../components/board/KanbanBoard";
import { ApplicationFormModal } from "../components/applications/ApplicationFormModal";

export const Board = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
    toast.success("Logged out successfully");
  };

  // Fetch applications once and let React Query handle loading, caching, and refetching
  const { data: applications = [], isLoading, isError } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await api.get("/api/applications");
      return res.data.applications as Application[];
    },
  });

  // Filter already-fetched applications without making another API request
  const filteredApplications = applications.
    filter((application) => {
      const matchesSearch = 
        application.companyName.toLowerCase().includes(search.toLowerCase()) || 
        application.role.toLowerCase().includes(search.toLowerCase());

      const matchesWorkType =
        workTypeFilter === "all" || application.workType === workTypeFilter;

      return matchesSearch && matchesWorkType;

    }).sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      if (sortBy === "company") {
        return a.companyName.localeCompare(b.companyName);
      }

      if (sortBy === "role") {
        return a.role.localeCompare(b.role);
      }

      return 0;
    });

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  if (isLoading) return <p className="p-6">Loading applications...</p>;
  if (isError) return <p className="p-6 text-red-600">Failed to load applications.</p>;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Application Board</h1>
          
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white hover:opacity-90"
            aria-label="Open profile menu"
          >
            {initials}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded border bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  navigate("/profile");
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Profile details
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  setIsProfileMenuOpen(false);
                  await handleLogout();
                }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          className="w-full rounded border p-2 lg:max-w-sm"
          placeholder="Search by company or role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            className="rounded border bg-white px-3 py-2"
            value={workTypeFilter}
            onChange={(e) => setWorkTypeFilter(e.target.value)}
          >
            <option value="all">All work types</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>

          <select
            className="rounded border bg-white px-3 py-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="company">Company A-Z</option>
            <option value="role">Role A-Z</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded bg-black px-4 py-2 text-white"
          >
            + Add Application
          </button>
        </div>
      </div>

      <KanbanBoard applications={filteredApplications} />

      {isAddModalOpen && (
        <ApplicationFormModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </main>
  );
};