import type { Provider } from "./types";

/**
 * GMI Cloud integration — "one key, many model types".
 *  - Text (LLM):   OpenAI-compatible  https://api.gmi-serving.com/v1/chat/completions
 *  - Image (T2I):  Inference Engine   https://console.gmicloud.ai/api/v1/ie/requestqueue/apikey/requests
 *  - Audio (TTS):  Inference Engine   (same endpoint, different model)
 *  - Music:        Inference Engine   (same endpoint, different model)
 *
 * GMI is PRIMARY. Nebius is a TEXT-ONLY fallback (burst / GMI failure).
 * All functions return { value, provider } so the UI can show provenance.
 * Mock mode (blank key) returns high-quality canned data so the demo runs keyless.
 */

const LLM_URL = "https://api.gmi-serving.com/v1/chat/completions";
const IE_URL = "https://console.gmicloud.ai/api/v1/ie/requestqueue/apikey/requests";
const NEBIUS_URL = "https://api.studio.nebius.com/v1/chat/completions";

const GMI_KEY = process.env.GMI_API_KEY ?? "";
const NEBIUS_KEY = process.env.NEBIUS_API_KEY ?? "";

export const MOCK = !GMI_KEY || process.env.GMI_MOCK === "1";
export const HAS_NEBIUS = !!NEBIUS_KEY;

const MODELS = {
  llm: process.env.GMI_LLM_MODEL || "deepseek-ai/DeepSeek-V3",
  nebiusLlm: process.env.NEBIUS_LLM_MODEL || "deepseek-ai/DeepSeek-V3",
  image: process.env.GMI_IMAGE_MODEL || "seedream-4-0-250828",
  tts: process.env.GMI_TTS_MODEL || "inworld-tts-1.5-mini",
  voice: process.env.GMI_TTS_VOICE || "Ashley",
  music: process.env.GMI_MUSIC_MODEL || "minimax-music-2-5",
};

export type Result<T> = { value: T; provider: Provider };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function stripJson(raw: string): string {
  let s = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a !== -1 && b !== -1) s = s.slice(a, b + 1);
  return s;
}

// ---------------------------------------------------------------------------
// LLM (GMI primary → Nebius fallback)
// ---------------------------------------------------------------------------

export async function chat(
  system: string,
  user: string,
  opts: { json?: boolean; mock: () => unknown }
): Promise<Result<unknown>> {
  if (MOCK) {
    await wait(700);
    return { value: opts.mock(), provider: "mock" };
  }

  const body = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.8,
    max_tokens: 1400,
    ...(opts.json ? { response_format: { type: "json_object" } } : {}),
  };

  // Try GMI first, then Nebius.
  const attempts: Array<{ url: string; key: string; model: string; provider: Provider }> = [
    { url: LLM_URL, key: GMI_KEY, model: MODELS.llm, provider: "GMI" },
  ];
  if (HAS_NEBIUS) {
    attempts.push({ url: NEBIUS_URL, key: NEBIUS_KEY, model: MODELS.nebiusLlm, provider: "Nebius" });
  }

  let lastErr: unknown;
  for (const a of attempts) {
    try {
      const res = await fetch(a.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${a.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: a.model, ...body }),
      });
      if (!res.ok) throw new Error(`${a.provider} ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content ?? "";
      const value = opts.json ? JSON.parse(stripJson(content)) : content;
      return { value, provider: a.provider };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("LLM failed");
}

// ---------------------------------------------------------------------------
// Image (hero + logo share this) · GMI only
// ---------------------------------------------------------------------------

export async function generateImage(
  prompt: string,
  kind: "hero" | "logo" = "hero",
  seed = prompt
): Promise<Result<string>> {
  if (MOCK) {
    await wait(kind === "logo" ? 1500 : 2000);
    return { value: kind === "logo" ? mockLogo(seed) : mockHero(seed), provider: "mock" };
  }
  const res = await fetch(IE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${GMI_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODELS.image,
      payload: {
        prompt,
        size: kind === "logo" ? "512x512" : "1024x1024",
        max_images: 1,
        watermark: false,
        response_format: "url",
      },
    }),
  });
  if (!res.ok) throw new Error(`GMI image ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const url = data?.outcome?.media_urls?.[0]?.url;
  if (!url) throw new Error("GMI image: no media_urls");
  return { value: url, provider: "GMI" };
}

// ---------------------------------------------------------------------------
// Voice (TTS) · GMI only
// ---------------------------------------------------------------------------

export async function generateVoice(script: string): Promise<Result<string>> {
  if (MOCK) {
    await wait(2300);
    return { value: mockTone(1.5, [523.25, 659.25, 783.99]), provider: "mock" };
  }
  const res = await fetch(IE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${GMI_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODELS.tts,
      payload: {
        text: script,
        voice_id: MODELS.voice,
        audio_encoding: "MP3",
        sample_rate_hertz: 22050,
        speaking_rate: 1.0,
        temperature: 1.0,
      },
    }),
  });
  if (!res.ok) throw new Error(`GMI TTS ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const url = data?.outcome?.audio_url ?? data?.outcome?.media?.[0]?.url;
  if (!url) throw new Error("GMI TTS: no audio_url");
  return { value: url, provider: "GMI" };
}

// ---------------------------------------------------------------------------
// Music · GMI only (best-effort; shape may need confirming in dashboard)
// ---------------------------------------------------------------------------

export async function generateMusic(prompt: string): Promise<Result<string>> {
  if (MOCK) {
    await wait(2700);
    return { value: mockTone(2.6, [261.63, 329.63, 392.0, 523.25], true), provider: "mock" };
  }
  const res = await fetch(IE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${GMI_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODELS.music,
      payload: { prompt, audio_encoding: "MP3", duration: 8 },
    }),
  });
  if (!res.ok) throw new Error(`GMI music ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const url = data?.outcome?.audio_url ?? data?.outcome?.media_urls?.[0]?.url;
  if (!url) throw new Error("GMI music: no audio_url");
  return { value: url, provider: "GMI" };
}

// ---------------------------------------------------------------------------
// Mock asset synthesis (self-contained data URIs)
// ---------------------------------------------------------------------------

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mockHero(seed: string): string {
  const h = hash(seed);
  const a = h % 360, b = (h * 7) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
    <defs><radialGradient id="g" cx="32%" cy="28%" r="95%">
      <stop offset="0%" stop-color="hsl(${a},85%,62%)"/>
      <stop offset="55%" stop-color="hsl(${b},70%,30%)"/>
      <stop offset="100%" stop-color="#08080A"/>
    </radialGradient></defs>
    <rect width="1024" height="1024" fill="url(#g)"/>
    <circle cx="660" cy="560" r="240" fill="#D4F23C" opacity="0.10"/>
    <rect x="120" y="120" width="784" height="784" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"/>
    <text x="50%" y="93%" fill="#ffffff" opacity="0.45" font-family="monospace" font-size="22" text-anchor="middle">MOCK HERO · ${esc(seed.slice(0, 40))}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function mockLogo(seed: string): string {
  const initials = seed.replace(/[^a-zA-Z ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "LS";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
    <rect width="512" height="512" fill="#0E0E11"/>
    <rect x="36" y="36" width="440" height="440" fill="none" stroke="#D4F23C" stroke-width="6"/>
    <text x="50%" y="54%" fill="#D4F23C" font-family="'Syne',sans-serif" font-weight="800" font-size="200" text-anchor="middle" dominant-baseline="middle">${esc(initials)}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function esc(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}

/** Short pleasant WAV chime/arpeggio so audio cards are playable in mock mode. */
function mockTone(seconds: number, freqs: number[], arp = false): string {
  const sr = 16000;
  const n = Math.floor(sr * seconds);
  const data = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.min(1, t * 6) * Math.max(0, 1 - t / seconds);
    let s = 0;
    if (arp) {
      const idx = Math.min(freqs.length - 1, Math.floor((t / seconds) * freqs.length));
      s = Math.sin(2 * Math.PI * freqs[idx] * t) * 0.6;
    } else {
      for (const f of freqs) s += Math.sin(2 * Math.PI * f * t);
      s = (s / freqs.length) * 0.7;
    }
    data.writeInt16LE(Math.round(s * env * 32767 * 0.55), i * 2);
  }
  const hdr = Buffer.alloc(44);
  hdr.write("RIFF", 0); hdr.writeUInt32LE(36 + data.length, 4); hdr.write("WAVE", 8);
  hdr.write("fmt ", 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(1, 22);
  hdr.writeUInt32LE(sr, 24); hdr.writeUInt32LE(sr * 2, 28); hdr.writeUInt16LE(2, 32); hdr.writeUInt16LE(16, 34);
  hdr.write("data", 36); hdr.writeUInt32LE(data.length, 40);
  return `data:audio/wav;base64,${Buffer.concat([hdr, data]).toString("base64")}`;
}
