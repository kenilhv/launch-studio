# Setup — Launch Studio

Get running in ~2 minutes. Works **with no API key** (demo mode) out of the box.

## 1. Clone & install
```bash
git clone https://github.com/kenilhv/launch-studio
cd launch-studio
npm install
```

## 2. Run (demo mode — no key needed)
```bash
npm run dev
# open http://localhost:3000  →  type a product  →  "Hire the team"
```
The header pill shows **DEMO MODE**. Everything works with built-in mock data.

## 3. Go live with GMI (for the real demo)
Create `.env.local` in the project root (this file is gitignored — never commit it):
```
GMI_API_KEY=your_gmi_key_here
```
Restart `npm run dev`. The pill flips to **LIVE · GMI** and all model calls hit GMI Cloud.

Optional — confirm the model IDs in your GMI dashboard match these (override in `.env.local` if not):
```
GMI_LLM_MODEL=deepseek-ai/DeepSeek-V3
GMI_IMAGE_MODEL=seedream-4-0-250828
GMI_TTS_MODEL=inworld-tts-1.5-mini
GMI_MUSIC_MODEL=minimax-music-2-5
# Optional text-only fallback:
# NEBIUS_API_KEY=your_nebius_key
```

## 4. Architecture (where things live)
- `src/app/page.tsx` — the Agent Control Room UI.
- `src/app/api/run/route.ts` — orchestrator; streams agent events (NDJSON).
- `src/lib/agents.ts` — Creative Director, Copywriter, Art Director (critic).
- `src/lib/gmi.ts` — all GMI calls (text/image/voice/music) + Nebius fallback + mock.
- `docs/` — project context + task split for Kenil & Aarsh.

## 5. Deploy (AgentBox)
`Dockerfile` is ready (Next.js standalone). Use the AgentBox deploy wizard and set
`GMI_API_KEY` as an env var, or build locally:
```bash
docker build -t launch-studio .
docker run -p 3000:3000 -e GMI_API_KEY=... launch-studio
```
