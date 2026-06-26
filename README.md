# 📦 Campaign-in-a-Box

**Hire an AI marketing team in one click.** One product brief in → a complete
launch kit out: landing-page copy, a hero image, and a voiceover ad — built by
three AI workers running on **GMI Cloud** (one key, three model types).

Built for the Beta Fund AI Agents Hackathon · ships on **AgentBox**.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Runs in **demo mode** out of the box (no key needed). To go live, add your key:

```bash
# .env.local
GMI_API_KEY=sk-...
```

The app auto-switches to live GMI calls when the key is present. The header pill
shows **Demo mode** vs **Live · GMI**.

## How it works

1. `POST /api/copy` — LLM writes the campaign (and the image prompt + ad script).
2. In parallel: `POST /api/image` (Seedream) + `POST /api/voice` (Inworld TTS).
3. The UI shows each worker go idle → working → done, then assembles the kit.

All three calls use the **same** `GMI_API_KEY`. See `src/lib/gmi.ts`.

## Deploy on AgentBox

The repo includes a `Dockerfile` (Next.js standalone). Either let AgentBox build
the container from the repo, or build locally:

```bash
docker build -t campaign-in-a-box .
docker run -p 3000:3000 -e GMI_API_KEY=sk-... campaign-in-a-box
```

Set `GMI_API_KEY` as an env var in the AgentBox deploy wizard.

## Config

| Env | Default | Purpose |
|-----|---------|---------|
| `GMI_API_KEY` | — | GMI Cloud key (blank = demo mode) |
| `GMI_MOCK` | — | `1` forces demo mode even with a key |
| `GMI_LLM_MODEL` | `deepseek-ai/DeepSeek-V3` | copywriter |
| `GMI_IMAGE_MODEL` | `seedream-4-0-250828` | hero image |
| `GMI_TTS_MODEL` | `inworld-tts-1.5-mini` | voiceover |
| `GMI_TTS_VOICE` | `Ashley` | TTS voice id |

> Confirm exact model IDs in your GMI dashboard — they can be swapped via env
> with zero code changes (GMI is OpenAI-compatible).
