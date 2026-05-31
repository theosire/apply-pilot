import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { Application } from '../../../shared/types/application';
import { KanbanBoard } from "../components/board/KanbanBoard";

export const Board = () => {
    // Fetch applications once and let React Query handle loading, caching, and refetching
    const { data: applications = [], isLoading, isError } = useQuery({
        queryKey: ["applications"],
        queryFn: async () => {
            const res = await api.get("/api/applications");
            return res.data.applications as Application[];
        },
    });

    if (isLoading) {
        return <p className="p-6">Loading applications...</p>;
    }

    if (isError) {
        return <p className="p-6 text-red-600">Failed to load applications.</p>;
    }

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <h1 className="mb-6 text-2xl font-semibold">Application Board</h1>

            <KanbanBoard applications={applications} />
        </main>
    );
};