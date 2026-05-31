import type { Application } from "../../../../shared/types/application";
import { KanbanColumn } from "./KanbanColumn";

type KanbanBoardProps = {
    applications: Application[];
};

// Fixed column order matches the backend application status values
const columns = [
    "Saved",
    "Applied",
    "Phone Screen",
    "Technical Interview",
    "Final Round",
    "Offer",
    "Rejected / Closed",  
];

export const KanbanBoard = ({ applications } : KanbanBoardProps) => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7">
            {columns.map((status) => {
                // Group applications into the column that matches their status
                const columnApplications = applications.filter(
                    (application) => application.status === status
                );

                return (
                    <KanbanColumn
                        key={status}
                        title={status}
                        applications={columnApplications}
                    />
                );
            })}
        </div>
    );
};