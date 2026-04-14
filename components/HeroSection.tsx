"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { api } from "@/lib/api";
import { Link2, Loader2, Scissors } from "lucide-react";

import { Badge, Button, Input } from "@/common";

export function HeroClipsSection() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUrl = videoUrl.trim();
    setError(null);
    setResult(null);

    if (!trimmedUrl) {
      setError("Please add a video URL first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(api.jobs.create(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ youtubeUrl: trimmedUrl }),
      });
      if (!response.ok) {
        const text = await response.text();
        let message = "Could not create clips.";
        try {
          const json = JSON.parse(text);
          message = json.error ?? json.message ?? message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }

      const payload = await response.text();
      setResult(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create clips. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative isolate overflow-hidden bg-[#060606] text-white">
      <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="mx-auto flex min-h-[90vh] w-full max-w-6xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <Badge
          variant="outline"
          className="border-white/20 bg-white/5 px-4 py-1 text-[0.68rem] tracking-[0.24em] text-white uppercase"
        >
          #1 AI VIDEO CLIPPING TOOL
        </Badge>

        <h1 className="mt-8 text-balance text-4xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-7xl">
          1 long video, 10 viral clips. Create 10x faster.
        </h1>

        <p className="mt-5 max-w-3xl text-balance text-base text-white/60 sm:text-lg">
          Turn long-form videos into social-ready short clips in minutes. Paste
          a URL, request clips, and preview your generated moments.
        </p>

        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          className="mt-10 w-full max-w-4xl"
        >
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="flex w-full items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] p-2 shadow-[0_16px_50px_-26px_rgba(255,255,255,0.7)] backdrop-blur-xl">
              <Link2 className="ml-3 size-4 shrink-0 text-white/50" />

              <Input
                type="url"
                inputMode="url"
                placeholder="Drop a video link"
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                className="h-12 border-0 bg-transparent px-0 text-base text-white shadow-none placeholder:text-white/45 focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
                required
              />

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="h-12 rounded-full bg-white px-7 text-base text-black hover:bg-white/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Getting clips
                  </>
                ) : (
                  "Get free clips"
                )}
              </Button>
            </div>

            <p className="text-sm text-white/70">or</p>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 rounded-full border-white/20 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
            >
              Upload files
            </Button>
          </div>
        </form>

        <div className="mt-5 h-6">
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>

        {result && (
          <div className="mt-6 w-full max-w-4xl rounded-3xl border border-white/15 bg-white/[0.04] p-6 text-left backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Scissors className="size-4" />
              <span>Request accepted</span>
            </div>

            <p className="mt-3 text-sm text-white/65">{result?.toString()}</p>
          </div>
        )}
      </div>
    </section>
  );
}
