import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../lib/axios";

type CoverLetterPanelProps = {
  applicationId: string;
  initialCoverLetter?: string;
};

const tones = ["Professional", "Conversational", "Concise"];

export const CoverLetterPanel = ({
  applicationId,
  initialCoverLetter = "",
}: CoverLetterPanelProps) => {
  const queryClient = useQueryClient();

  const [tone, setTone] = useState("Professional");
  const [coverLetter, setCoverLetter] = useState(initialCoverLetter);
  const [isGenerating, setIsGenerating] = useState(false);

  const saveCoverLetter = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/api/applications/${applicationId}`, {
        coverLetter,
      });

      return res.data.application;
    },
    onSuccess: () => {
      toast.success("Cover letter saved");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: () => {
      toast.error("Failed to save cover letter");
    },
  });

  const generateCoverLetter = async () => {
    setCoverLetter("");
    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/cover-letter`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId,
            tone,
          }),
        }
      );

      if (!response.body) {
        throw new Error("No response stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const data = line.replace("data: ", "");

          if (data === "[DONE]") {
            setIsGenerating(false);
            return;
          }

          const parsed = JSON.parse(data);

          if (parsed.text) {
            setCoverLetter((current) => current + parsed.text);
          }
        }
      }
    } catch {
      toast.error("Failed to generate cover letter");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(coverLetter);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">AI Cover Letter</h3>

        <select
          className="rounded border p-2 text-sm"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        >
          {tones.map((toneOption) => (
            <option key={toneOption} value={toneOption}>
              {toneOption}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={generateCoverLetter}
        disabled={isGenerating}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {isGenerating ? "Generating..." : "Generate cover letter"}
      </button>

      <div className="min-h-40 whitespace-pre-wrap rounded border bg-gray-50 p-3 text-sm">
        {coverLetter}
        {isGenerating && <span className="animate-pulse">▌</span>}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={copyToClipboard}
          disabled={!coverLetter}
          className="rounded border px-4 py-2 text-sm disabled:opacity-50"
        >
          Copy
        </button>

        <button
          type="button"
          onClick={() => saveCoverLetter.mutate()}
          disabled={!coverLetter || saveCoverLetter.isPending}
          className="rounded border px-4 py-2 text-sm disabled:opacity-50"
        >
          {saveCoverLetter.isPending ? "Saving..." : "Save to card"}
        </button>
      </div>
    </div>
  );
};