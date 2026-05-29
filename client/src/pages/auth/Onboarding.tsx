import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Onboarding = () => {
    const [currentTitle, setCurrentTitle] = useState("");
    const [yearsExperience, setYearsExperience] = useState("");
    const [skillInput, setSkillInput] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [bio, setBio] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [targetSalary, setTargetSalary] = useState("");

    const { updateBackground } = useAuth();
    const navigate = useNavigate();

    const addSkill = (e: any) => {
        if (e.key !== "Enter") return;

        e.preventDefault();

        if (!skillInput.trim()) return;

        setSkills([...skills, skillInput.trim()]);
        setSkillInput("");
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        await updateBackground({
            currentTitle,
            yearsExperience: Number(yearsExperience),
            skills,
            bio,
            targetRole,
            targetSalary: Number(targetSalary),
        });

        navigate("/board");
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-4 p-6">
            <input
                className="w-full rounded border p-2"
                placeholder="Current title"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
            />

            <input
                className="w-full rounded border p-2"
                placeholder="Years of Experience"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
            />

            <input
                className="w-full rounded border p-2"
                placeholder="Type a skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
            />

            <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <span key={skill} className="rounded bg-gray-200 px-2 py-1">
                        {skill}
                    </span>
                ))}
            </div>

            <textarea
                className="w-full rounded border p-2"
                placeholder="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
            />

            <input
                className="w-full rounded border p-2"
                placeholder="Target role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
            />

            <input
                className="w-full rounded border p-2"
                placeholder="Target salary"
                value={targetSalary}
                onChange={(e) => setTargetSalary(e.target.value)}
            />

            <button className="w-full rounded bg-black px-4 py-2 text-white">
                Finish onboarding
            </button>
        </form>
    );
};