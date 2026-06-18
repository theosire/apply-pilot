import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export const Profile = () => {
  const { user, updateBackground } = useAuth();
  const navigate = useNavigate();

  const background = user?.background;

  const [currentTitle, setCurrentTitle] = useState(background?.currentTitle || "");
  const [yearsExperience, setYearsExperience] = useState(
    background?.yearsExperience || 0
  );
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(background?.skills || []);
  const [bio, setBio] = useState(background?.bio || "");
  const [targetRole, setTargetRole] = useState(background?.targetRole || "");
  const [targetSalary, setTargetSalary] = useState(background?.targetSalary || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    const skill = skillInput.trim();
    if (!skill || skills.includes(skill)) return;

    setSkills([...skills, skill]);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateBackground({
        currentTitle,
        yearsExperience,
        skills,
        bio,
        targetRole,
        targetSalary,
      });

      toast.success("Profile updated");
      navigate("/board");
    } catch {
      toast.error("Could not update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-xl space-y-4 rounded-lg border bg-white p-6 shadow-sm"
      >
        <div>
          <h1 className="text-2xl font-semibold">Edit profile</h1>
          <p className="text-sm text-gray-500">
            Update your background and job search preferences.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Current title</label>
          <input
            className="w-full rounded border p-2"
            placeholder="Current title"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
          />
        </div>
        
        <div>
          <label className="mb-1 block text-sm font-medium">
            Years of experience
          </label>
          <input
            type="number"
            min="0"
            className="w-full rounded border p-2"
            placeholder="Years of experience"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Skills</label>
          <input
            className="w-full rounded border p-2"
            placeholder="Type a skill and press Enter"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={addSkill}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => removeSkill(skill)}
              className="rounded bg-gray-200 px-2 py-1 text-sm hover:bg-gray-300"
            >
              {skill} ×
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea
            className="w-full rounded border p-2"
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Target role</label>
          <input
            className="w-full rounded border p-2"
            placeholder="Target role"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Target salary
          </label>
          <input
            type="number"
            min="0"
            className="w-full rounded border p-2"
            placeholder="Target salary"
            value={targetSalary}
            onChange={(e) => setTargetSalary(Number(e.target.value))}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/board")}
            className="w-full rounded border px-4 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </main>
  );
};