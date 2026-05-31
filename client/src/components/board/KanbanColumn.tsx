import type { Application } from "../../../../shared/types/application";
import { ApplicationCard } from "./ApplicationCard";

type KanbanColumnProps = {
    title: string;
    applications: Application[];
};

export const KanbanColumn = ({ title, applications }: KanbanColumnProps) => {
    return (
        <section className="rounded-lg border bg-white p-3">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{title}</h2>

                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                    {applications.length}
                </span>
            </div>

            <div className="space-y-3">
                {applications.map((application) => (
                    <ApplicationCard key={application._id} application={application} />
                ))}
            </div>
        </section>
    );
};