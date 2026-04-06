type ClipsRequestBody = {
  videoUrl?: unknown;
};

type GeneratedClip = {
  title: string;
  range: string;
  reason: string;
};

const DEFAULT_EXTERNAL_API_URL = "https://jsonplaceholder.typicode.com/posts";
const EXTERNAL_API_URL =
  process.env.CLIPS_EXTERNAL_API_URL ?? DEFAULT_EXTERNAL_API_URL;
const EXTERNAL_API_KEY = process.env.CLIPS_EXTERNAL_API_KEY;

function isValidVideoUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function buildClipSuggestions(videoUrl: string): GeneratedClip[] {
  const hostname = new URL(videoUrl).hostname.replace("www.", "");

  return [
    {
      title: "High-Impact Hook",
      range: "00:00 - 00:22",
      reason: `Fast intro built for attention on ${hostname}.`,
    },
    {
      title: "Core Breakdown",
      range: "01:10 - 01:42",
      reason: "Main value segment with strongest retention potential.",
    },
    {
      title: "CTA Moment",
      range: "02:18 - 02:40",
      reason: "Closing punchline that works as a conversion clip.",
    },
  ];
}

export async function POST(request: Request) {
  let body: ClipsRequestBody;

  try {
    body = (await request.json()) as ClipsRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const videoUrl =
    typeof body.videoUrl === "string" ? body.videoUrl.trim() : "";

  if (!videoUrl) {
    return Response.json(
      { error: "Please provide a video URL." },
      { status: 400 },
    );
  }

  if (!isValidVideoUrl(videoUrl)) {
    return Response.json(
      { error: "Please provide a valid URL (http/https)." },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(EXTERNAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(EXTERNAL_API_KEY
          ? { Authorization: `Bearer ${EXTERNAL_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        action: "generate_clips",
        requestedAt: new Date().toISOString(),
        videoUrl,
      }),
      cache: "no-store",
    });

    const upstreamContentType =
      upstreamResponse.headers.get("content-type") ?? "";

    const upstreamPayload = upstreamContentType.includes("application/json")
      ? await upstreamResponse.json()
      : await upstreamResponse.text();

    if (!upstreamResponse.ok) {
      return Response.json(
        {
          error: "External clip API request failed.",
          upstreamStatus: upstreamResponse.status,
          upstreamPayload,
        },
        { status: 502 },
      );
    }

    return Response.json({
      requestId: crypto.randomUUID(),
      sourceUrl: videoUrl,
      upstreamStatus: upstreamResponse.status,
      clips: buildClipSuggestions(videoUrl),
      upstreamPayload,
    });
  } catch {
    return Response.json(
      { error: "Could not reach the external clip API." },
      { status: 502 },
    );
  }
}
