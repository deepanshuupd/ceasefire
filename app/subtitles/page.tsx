"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const timestampPattern =
  /^(\d{2}:\d{2}:\d{2}[\.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[\.,]\d{3})$/;

function normalizeTimestamp(value: string) {
  return value.trim().replace(/\,(?=\d{3}$)/, ".");
}

function parseTimestamp(value: string) {
  const normalized = normalizeTimestamp(value);
  const matches = normalized.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  if (!matches) return "00:00:00.000";

  const [, hours, minutes, seconds, millis] = matches;
  return `${hours}:${minutes}:${seconds}.${millis}`;
}

function parseTimeToSeconds(value: string) {
  const normalized = normalizeTimestamp(value);
  const matches = normalized.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  if (!matches) return 0;

  const [, hours, minutes, seconds, millis] = matches;
  return (
    Number(hours) * 3600 +
    Number(minutes) * 60 +
    Number(seconds) +
    Number(millis) / 1000
  );
}

function formatCaptionText(text: string) {
  return text.trim().replace(/\r/g, "");
}

function getId() {
  return typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseSrt(text: string) {
  const entries = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return entries
    .map((block) => {
      const lines = block.split("\n");
      const timeLine = lines.find((line) => timestampPattern.test(line));
      if (!timeLine) return null;

      const [start, end] = timeLine.match(timestampPattern)!.slice(1, 3);
      const textLines = lines.slice(lines.indexOf(timeLine) + 1);
      return {
        id: getId(),
        start: parseTimestamp(start),
        end: parseTimestamp(end),
        text: formatCaptionText(textLines.join("\n")),
      };
    })
    .filter((entry): entry is Caption => entry !== null);
}

function parseVtt(text: string) {
  const cleaned = text.replace(/^WEBVTT.*\n/, "");
  return parseSrt(cleaned);
}

function parseTxt(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const lines = normalized.split("\n");
  const blocks = normalized.split(/\n{2,}/);
  const parsed = blocks
    .map((block) => {
      const blockLines = block.split("\n");
      const timeLine = blockLines.find((line) =>
        timestampPattern.test(line.trim()),
      );
      if (timeLine) {
        const [start, end] = timeLine.match(timestampPattern)!.slice(1, 3);
        const textLines = blockLines.slice(blockLines.indexOf(timeLine) + 1);
        return {
          id: getId(),
          start: parseTimestamp(start),
          end: parseTimestamp(end),
          text: formatCaptionText(textLines.join("\n")),
        };
      }
      return null;
    })
    .filter((entry): entry is Caption => entry !== null);

  if (parsed.length > 0) return parsed;

  return lines.filter(Boolean).map((line, index) => {
    const startSeconds = index * 5;
    const hours = String(Math.floor(startSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((startSeconds % 3600) / 60)).padStart(
      2,
      "0",
    );
    const seconds = String(startSeconds % 60).padStart(2, "0");
    return {
      id: getId(),
      start: `${hours}:${minutes}:${seconds}.000`,
      end: `${hours}:${minutes}:${String((startSeconds + 5) % 60).padStart(2, "0")}.000`,
      text: formatCaptionText(line),
    };
  });
}

const captionTemplates = [
  {
    id: "modern",
    label: "Modern Bold",
    sample: "Do you know what happened next?",
  },
  {
    id: "minimal",
    label: "Minimal Light",
    sample: "Simple caption layout with clean spacing.",
  },
  {
    id: "neon",
    label: "Neon Outline",
    sample: "Bright caption styling for social video.",
  },
  {
    id: "classic",
    label: "Classic Subtitle",
    sample: "Traditional subtitle style for interviews.",
  },
];

type Caption = {
  id: string;
  start: string;
  end: string;
  text: string;
};

function SubtitlesPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [captionFileName, setCaptionFileName] = useState<string>("");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [selectedCaptionId, setSelectedCaptionId] = useState<string | null>(
    null,
  );
  const [manualText, setManualText] = useState("");
  const [manualStart, setManualStart] = useState("00:00:00.000");
  const [manualEnd, setManualEnd] = useState("00:00:05.000");
  const [status, setStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"templates" | "edit">("edit");

  const timelineDuration = useMemo(() => {
    if (captions.length === 0) return 10;
    return Math.max(
      10,
      ...captions.map((caption) => parseTimeToSeconds(caption.end)),
    );
  }, [captions]);

  const previewCaption = useMemo(
    () =>
      captions.find((caption) => caption.id === selectedCaptionId) ??
      captions[captions.length - 1] ??
      null,
    [captions, selectedCaptionId],
  );

  const videoSrc = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : null),
    [videoFile],
  );

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [videoSrc]);

  const selectCaption = (caption: Caption | null) => {
    setSelectedCaptionId(caption?.id ?? null);
    setManualText(caption?.text ?? "");
    setManualStart(caption?.start ?? "00:00:00.000");
    setManualEnd(caption?.end ?? "00:00:05.000");
  };

  const handleVideoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setVideoFile(file);
    setStatus(file ? `Loaded video: ${file.name}` : null);
  };

  const handleCaptionsUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCaptionFileName(file.name);

    const text = await file.text();
    const lowerName = file.name.toLowerCase();
    let parsed: Caption[] = [];

    if (lowerName.endsWith(".srt")) parsed = parseSrt(text);
    else if (lowerName.endsWith(".vtt")) parsed = parseVtt(text);
    else parsed = parseTxt(text);

    if (parsed.length === 0) {
      setStatus("Could not parse captions. Please check file format.");
      return;
    }

    setCaptions(parsed);
    selectCaption(parsed[0] ?? null);
    setStatus(
      `Imported ${parsed.length} caption${parsed.length === 1 ? "" : "s"}`,
    );
  };

  const handleSaveCaption = () => {
    if (!manualText.trim()) {
      setStatus("Caption text is required.");
      return;
    }

    if (!selectedCaptionId) {
      const nextCaption: Caption = {
        id: getId(),
        start: parseTimestamp(manualStart),
        end: parseTimestamp(manualEnd),
        text: formatCaptionText(manualText),
      };
      setCaptions((current) => [...current, nextCaption]);
      selectCaption(nextCaption);
      setStatus("Caption saved.");
      return;
    }

    setCaptions((current) =>
      current.map((caption) =>
        caption.id === selectedCaptionId
          ? {
              ...caption,
              start: parseTimestamp(manualStart),
              end: parseTimestamp(manualEnd),
              text: formatCaptionText(manualText),
            }
          : caption,
      ),
    );
    setStatus("Caption saved.");
  };

  const handleAddCaption = () => {
    const caption: Caption = {
      id: getId(),
      start: "00:00:00.000",
      end: "00:00:05.000",
      text: "",
    };
    setCaptions((current) => [...current, caption]);
    selectCaption(caption);
    setStatus("New caption added.");
  };

  const handleDownloadSrt = () => {
    if (captions.length === 0) {
      setStatus("No captions available to download.");
      return;
    }

    const srtText = captions
      .map((caption, index) => {
        const start = caption.start.replace(/\./g, ",");
        const end = caption.end.replace(/\./g, ",");
        return `${index + 1}\n${start} --> ${end}\n${caption.text}`;
      })
      .join("\n\n");

    const blob = new Blob([srtText], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "captions.srt";
    anchor.click();
    URL.revokeObjectURL(href);
    setStatus("Downloaded captions as captions.srt");
  };

  const handleExportProject = () => {
    setStatus("Export is ready. Embedding will be added later.");
  };

  const handleDeleteCaption = (id: string) => {
    setCaptions((current) => current.filter((caption) => caption.id !== id));
    setSelectedCaptionId((current) => (current === id ? null : current));
    if (selectedCaptionId === id) {
      const nextCaption = captions.find((caption) => caption.id !== id) ?? null;
      selectCaption(nextCaption);
    }
    setStatus("Caption removed.");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-3xl border border-white/10 bg-zinc-900/90 p-8 shadow-xl shadow-black/20 backdrop-blur-xl">
          <h1 className="text-3xl font-semibold text-white">Captions editor</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Upload a video and a captions file, or add captions manually.
            Supported formats:{" "}
            <span className="font-medium text-white">.srt</span>,{" "}
            <span className="font-medium text-white">.vtt</span>,{" "}
            <span className="font-medium text-white">.txt</span>.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
            <div className="grid gap-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-2 rounded-full bg-zinc-950/80 p-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("templates")}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        activeTab === "templates"
                          ? "bg-white text-black"
                          : "text-zinc-300 hover:bg-white/10"
                      }`}
                    >
                      Caption templates
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("edit")}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        activeTab === "edit"
                          ? "bg-white text-black"
                          : "text-zinc-300 hover:bg-white/10"
                      }`}
                    >
                      Captions editor
                    </button>
                  </div>
                  <div className="text-sm text-zinc-400">
                    {status ?? "Ready to edit captions"}
                  </div>
                </div>

                <div className="mt-6">
                  {activeTab === "templates" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {captionTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-sm shadow-black/20"
                        >
                          <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                            {template.label}
                          </p>
                          <div className="mt-4 rounded-3xl bg-white/10 p-4 text-sm text-white">
                            {template.sample}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
                        <h3 className="text-base font-semibold text-white">
                          Media inputs
                        </h3>
                        <p className="mt-2 text-sm text-zinc-400">
                          Upload your source video and captions file.
                        </p>

                        <div className="mt-6 space-y-4">
                          <div>
                            <label className="text-sm font-medium text-white">
                              Video
                            </label>
                            <Input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoUpload}
                              className="mt-3 max-w-full file:cursor-pointer"
                            />
                            {videoFile ? (
                              <p className="mt-2 text-sm text-emerald-300">
                                Loaded: {videoFile.name}
                              </p>
                            ) : null}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-white">
                              Captions
                            </label>
                            <Input
                              type="file"
                              accept=".srt,.vtt,.txt"
                              onChange={handleCaptionsUpload}
                              className="mt-3 max-w-full file:cursor-pointer"
                            />
                            {captionFileName ? (
                              <p className="mt-2 text-sm text-emerald-300">
                                Imported: {captionFileName}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-base font-semibold text-white">
                              Selected caption
                            </h3>
                            <p className="mt-2 text-sm text-zinc-400">
                              Edit caption text and timeframe.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddCaption}
                          >
                            Add caption
                          </Button>
                        </div>

                        <div className="mt-6 space-y-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label
                                className="text-sm font-medium text-white"
                                htmlFor="caption-start"
                              >
                                Start
                              </label>
                              <Input
                                id="caption-start"
                                type="text"
                                value={manualStart}
                                onChange={(event) =>
                                  setManualStart(event.target.value)
                                }
                                placeholder="00:00:00.000"
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <label
                                className="text-sm font-medium text-white"
                                htmlFor="caption-end"
                              >
                                End
                              </label>
                              <Input
                                id="caption-end"
                                type="text"
                                value={manualEnd}
                                onChange={(event) =>
                                  setManualEnd(event.target.value)
                                }
                                placeholder="00:00:05.000"
                                className="mt-2"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              className="text-sm font-medium text-white"
                              htmlFor="caption-text"
                            >
                              Text
                            </label>
                            <textarea
                              id="caption-text"
                              rows={5}
                              value={manualText}
                              onChange={(event) =>
                                setManualText(event.target.value)
                              }
                              className="mt-2 w-full resize-none rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white shadow-sm outline-none focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/10"
                              placeholder="Edit caption text"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <Button onClick={handleSaveCaption}>
                              Save caption
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setManualText("")}
                            >
                              Clear
                            </Button>
                            {selectedCaptionId ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDeleteCaption(selectedCaptionId)
                                }
                              >
                                Delete
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Timeline
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                      Scroll horizontally to review caption blocks across the
                      video.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddCaption}
                  >
                    Add caption
                  </Button>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <div className="flex min-w-[720px] gap-3 pb-4">
                    {captions.length === 0 ? (
                      <div className="flex min-w-[400px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-zinc-950/60 px-6 py-10 text-sm text-zinc-500">
                        No captions yet. Add one or import a file to build the
                        timeline.
                      </div>
                    ) : (
                      captions.map((caption) => {
                        const duration = Math.max(
                          0.5,
                          parseTimeToSeconds(caption.end) -
                            parseTimeToSeconds(caption.start),
                        );
                        const width = Math.max(
                          140,
                          (duration / timelineDuration) * 900,
                        );
                        const selected = caption.id === selectedCaptionId;

                        return (
                          <button
                            key={caption.id}
                            type="button"
                            onClick={() => selectCaption(caption)}
                            className={`group relative flex min-w-[140px] flex-col justify-between rounded-3xl border px-4 py-3 text-left transition ${
                              selected
                                ? "border-emerald-300 bg-emerald-400/10"
                                : "border-white/10 bg-zinc-950/80 hover:border-white/20 hover:bg-white/5"
                            }`}
                            style={{ width }}
                          >
                            <span className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                              {caption.start} — {caption.end}
                            </span>
                            <span className="mt-3 text-sm leading-6 text-white line-clamp-3">
                              {caption.text || "No caption text"}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Video workspace
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Preview the video and overlay the current captions in real
                    time.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadSrt}
                  >
                    Download SRT
                  </Button>
                  <Button size="sm" onClick={handleExportProject}>
                    Export
                  </Button>
                </div>
              </div>

              <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/10 bg-black">
                {videoSrc ? (
                  <video
                    controls
                    src={videoSrc}
                    className="h-full min-h-[420px] w-full object-contain bg-black"
                  />
                ) : (
                  <div className="flex h-[420px] items-center justify-center text-center text-zinc-500">
                    Upload a video to preview the workspace.
                  </div>
                )}

                {previewCaption ? (
                  <div className="absolute left-1/2 bottom-5 w-[min(92%,760px)] -translate-x-1/2 rounded-[36px] bg-black/80 px-5 py-3 text-center text-sm font-semibold text-white shadow-2xl shadow-black/50">
                    {previewCaption.text}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubtitlesPage;
