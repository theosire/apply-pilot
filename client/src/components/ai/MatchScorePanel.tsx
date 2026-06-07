import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../lib/axios";

type MatchScorePanelProps = {
  applicationId: string;
};

type MatchScore = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  seniorityMatch: string;
  summary: string;
};

export const MatchScorePanel = ({ applicationId }: MatchScorePanelProps) => {
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["match-score", applicationId],
    queryFn: async () => {
      const res = await api.post("/api/ai/match-score", { applicationId });
      return res.data.matchScore as MatchScore;
    },
    enabled: false,
    retry: false,
  });

  const handleAnalyze = async () => {
    const result = await refetch();

    if (result.isError) {
      toast.error("Failed to analyze match score");
    }
  };

  const scoreColor =
    data && data.score >= 80
      ? "text-green-600"
      : data && data.score >= 60
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">AI Match Score</h3>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isFetching}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {isFetching ? "Analyzing..." : "Analyze match"}
        </button>
      </div>

      {!data && !isFetching && !isError && (
        <p className="text-sm text-gray-500">
          Click analyze to compare this job with your profile.
        </p>
      )}

      {isError && (
        <p className="text-sm text-red-600">
          Failed to generate match score. Try again later.
        </p>
      )}

      {data && (
        <>
          <div>
            <p className={`text-5xl font-bold ${scoreColor}`}>
              {data.score}%
            </p>
            <p className="mt-2 text-sm text-gray-600">{data.summary}</p>
          </div>

          <p className="text-sm">
            <strong>Seniority match:</strong> {data.seniorityMatch}
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-semibold">✅ Skills found</h4>

              <div className="flex flex-wrap gap-2">
                {data.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-1 text-sm font-semibold">
                ❌ Missing keywords
              </h4>

              <p className="mb-2 text-xs text-gray-500">
                Add these to your resume if they match your real experience.
              </p>

              <div className="flex flex-wrap gap-2">
                {data.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};;