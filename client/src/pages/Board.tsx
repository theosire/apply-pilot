import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { Application } from '../../../shared/types/application';
import { KanbanBoard } from "../components/board/KanbanBoard";
import { AddApplicationModal } from "../components/applications/AddApplicationModal";

export const Board = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [remoteOnly, setRemoteOnly] = useState(false);

    // Fetch applications once and let React Query handle loading, caching, and refetching
    const { data: applications = [], isLoading, isError } = useQuery({
        queryKey: ["applications"],
        queryFn: async () => {
            const res = await api.get("/api/applications");
            return res.data.applications as Application[];
        },
    });

    // Filter already-fetched applications without making another API request
    const filteredApplications = applications.filter((application) => {
        const matchesSearch = 
            application.companyName.toLowerCase().includes(search.toLowerCase()) || 
            application.role.toLowerCase().includes(search.toLowerCase());

        const matchesRemote = !remoteOnly || application.workType === "remote";

        return matchesSearch && matchesRemote;
    });

    if (isLoading) return <p className="p-6">Loading applications...</p>;
    if (isError) return <p className="p-6 text-red-600">Failed to load applications.</p>;

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <h1 className="mb-6 text-2xl font-semibold">Application Board</h1>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input 
                    className="w-full rounded border p-2 sm:max-w-sm"
                    placeholder="Search by company or role"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <button
                    onClick={() => setRemoteOnly((value) => !value)}
                    className={`rounded border px-4 py-2 ${
                        remoteOnly ? "bg-black text-white" : "bg-white"
                    }`}
                >
                    Remote only
                </button>
            </div>

            <KanbanBoard applications={filteredApplications} />

            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-6 right-6 rounded-full bg-black px-5 py-4 text-2xl text-white shadow-lg"
            >
                +
            </button>

            {isAddModalOpen && (
                <AddApplicationModal onClose={() => setIsAddModalOpen(false)} />
            )}
        </main>
    );
};