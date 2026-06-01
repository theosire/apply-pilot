import { useEffect, useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import type { Application, ApplicationStatus } from "../../../../shared/types/application";
import { api } from "../../lib/axios";
import { KanbanColumn } from "./KanbanColumn";

type KanbanBoardProps = {
    applications: Application[];
};

// Fixed column order matches the backend application status values
const columns: ApplicationStatus[] = [
    "Saved",
    "Applied",
    "Phone Screen",
    "Technical Interview",
    "Final Round",
    "Offer",
    "Rejected / Closed",  
];


export const KanbanBoard = ({ applications } : KanbanBoardProps) => {
    const [localApplications, setLocalApplications] = useState(applications);

    useEffect(() => {
        setLocalApplications(applications);
    }, [applications]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;
    
        const applicationId = active.id as string;
        const newStatus = over.id as ApplicationStatus;
    
        const movedApplication = localApplications.find(
            (application) => application._id === applicationId
        );
    
        if (!movedApplication) return;

        if (movedApplication.status === newStatus) return;

        const previousApplications = localApplications;

        // Optimistic update: update UI immediately before API finishes
        const updatedApplications = localApplications.map((application) => 
            application._id === applicationId
                ? { ...application, status: newStatus, columnOrder: 0 }
                : application
        );

        setLocalApplications(updatedApplications);

        try {
            await api.patch(`/api/applications/${applicationId}/move`, {
                status: newStatus,
                columnOrder: 0,
            });
        } catch {
            setLocalApplications(previousApplications);
            alert("Failed to move application.");
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7">
                {columns.map((status) => {
                    // Group applications into the column that matches their status
                    const columnApplications = localApplications.filter(
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
        </DndContext>
    );
};