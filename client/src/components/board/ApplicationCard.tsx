import { useDraggable } from "@dnd-kit/core";
import type { Application } from "../../../../shared/types/application";

type ApplicationCardProps = {
    application: Application;
    onClick: (application: Application) => void;
};

export const ApplicationCard = ({ application, onClick }: ApplicationCardProps) => {
    const appliedDate = application.dateApplied || application.createdAt;
    
    // Show how long ago the user applied or created the application
    const daysAgo = Math.floor(
        (Date.now() - new Date(appliedDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const isStale = daysAgo >= 14;
    
    // Register the application card as a draggable item using its database id
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: application._id,
    });

    return (
        <article 
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={() => onClick(application)}
            style={{
                transform: transform
                    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                    : undefined,
            }}
            className="rounded-lg border bg-white p-3 shadow-sm"
        >
            <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                    {application.companyName[0]}
                </div>

                <div>
                    <h3 className="text-sm font-semibold">{application.role}</h3>
                    <p className="text-xs text-gray-500">{application.companyName}</p>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs">
                <span className="rounded-full bg-gray-100 px-2 py-1">
                    {application.workType}
                </span>

                <span className={isStale ? "text-amber-600" : "text-gray-500"}>
                    {isStale ? "⚠ " : ""}
                    {daysAgo}d ago
                </span>
            </div>
        </article>
    );
};