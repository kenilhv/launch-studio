# Cursor system/context prompt — Campaign-in-a-Box

Paste this at the start of a Cursor chat (or save as a `.cursorrules`) so the
model has full context when you iterate here.

---

You are working on **Campaign-in-a-Box**, an "AI Agents for Hire" hackathon
project (Beta Fund AI Agents Hackathon, judged by a 3-minute audience-voted
demo). The pitch: a user types one product brief and three AI workers produce a
complete launch kit — landing copy, a hero image, and a voiceover ad.

## Stack (do not change without reason)
- **Next.js 16** (App Router, `src/` dir, TypeScript), React 19.
- **Tailwind CSS v4** (`@import "tailwindcss"` in `globals.css`; no tailwind.config).
- **framer-motion** for animation.
- Note: this repo's `AGENTS.md` warns that Next.js APIs may differ from training
  data — when unsure about a Next API, check `node_modules/next/dist/docs/`.

## GMI Cloud integration — "one key, three model types"
All three model calls use the SAME `GMI_API_KEY` (Bearer). Mock mode is on
automatically when the key is blank (`src/lib/gmi.ts` → `MOCK`).
- **LLM (copy):** `POST https://api.gmi-serving.com/v1/chat/completions`
  (OpenAI-compatible). Default model `deepseek-ai/DeepSeek-V3`.
- **Image:** `POST https://console.gmicloud.ai/api/v1/ie/requestqueue/apikey/requests`
  body `{model, payload:{prompt, size, max_images, response_format:"url"}}`;
  result at `outcome.media_urls[0].url`. Default `seedream-4-0-250828`.
- **TTS:** same IE endpoint, body `{model, payload:{text, voice_id,
  audio_encoding:"MP3", sample_rate_hertz, speaking_rate, temperature}}`;
  result at `outcome.audio_url`. Default `inworld-tts-1.5-mini`.
- Model IDs are env-overridable (`GMI_LLM_MODEL`, `GMI_IMAGE_MODEL`,
  `GMI_TTS_MODEL`, `GMI_TTS_VOICE`). Confirm exact IDs in the GMI dashboard.

## File map
- `src/lib/gmi.ts` — all GMI calls + mock mode + WAV/SVG mock asset synthesis.
- `src/lib/types.ts` — `Campaign`, `WorkerStatus` types.
- `src/app/api/{copy,image,voice,status}/route.ts` — server routes (Node runtime).
- `src/app/page.tsx` — client UI: brief input → 3 worker cards (copy first, then
  image+voice in parallel) → assembled launch kit. The orchestration lives in
  `run()`.
- `Dockerfile` — Next standalone build for AgentBox deploy (`output:"standalone"`).

## How the flow works (keep this contract)
1. `POST /api/copy {brief}` → `{campaign}` (also returns `imagePrompt` + `adScript`).
2. In parallel: `POST /api/image {prompt: campaign.imagePrompt}` and
   `POST /api/voice {script: campaign.adScript}`.
3. UI reflects per-worker status: idle → working → done/error.

## Design language
Dark (`#07070d`), animated aurora blobs, glassmorphism cards (`.glass`),
violet→cyan gradient accents (`.gradient-text`), shimmer on "working" cards.
Keep it premium and minimal; the demo is judged on polish.

## Good tasks to ask Cursor for
- A "Download kit" button (zip the copy as .md + image + audio).
- Streaming the copy token-by-token into the Copywriter card.
- A second image variant / aspect-ratio toggle.
- Polishing empty/error states and mobile layout.
- A short "How it works" section under the fold for the demo.

Always preserve mock mode so the app runs without a key.
