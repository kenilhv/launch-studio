# 🚀 Launch Studio — Full Project Context

> Hand this to anyone joining the project cold. It contains everything you need to understand
> what we're building, why, how it's architected, what already exists, and how we split the work.
>
> **Team:** Kenil + Aarsh (2 builders)
> **Event:** Beta Fund AI Agents Hackathon — AWS Builder Loft, June 26 2026
> **Hard submission deadline:** 4:30 PM. Demos 4:30 PM, **audience voting 5:30 PM**.

---

## 1. One-liner

**Launch Studio is an AI agent you can hire to launch a product.** Give it one sentence about
your product, and a team of specialist AI agents autonomously produces a complete, on-brand
launch kit — logo, hero image, landing-page copy, social posts, and a voiceover ad — then a
critic agent reviews the whole thing for brand consistency and fixes the weakest pieces before
handing it back.

It's **Campaign-in-a-Box, leveled up into a self-correcting multi-agent studio.**

---

## 2. Why this wins (read this before coding)

We are optimizing for **two prizes**:

1. **🎖️ UpscaleX — "Most Innovative Agent Application" ($500).** Our innovation hook is the
   **multi-agent, self-correcting pipeline**: a Creative Director plans, specialists execute in
   parallel across *three+ model types on one GMI key*, and an Art Director critic scores the
   output and triggers a revision loop. It is not a prompt→output demo; it's agents that
   *delegate, produce, critique, and improve* — that's the "agent" story judges want.
2. **🏆 Audience Favorite (voting).** It demos beautifully in 3 minutes: type one line → watch a
   control room of agents light up → a gorgeous launch kit assembles itself → play the voiceover.
   Tangible, multimodal, visceral. People will vote for what looks magic and useful.

**Track fit:** "Agents for Hire" + "Marketplace-Ready MVPs" — we package and (mock-)list it on
**AgentBox** as a hireable agent.

### Judging alignment cheat-sheet
| Judge cares about | How we show it |
|---|---|
| Real "agent," not a chatbot | Planner + parallel specialists + critic revision loop |
| GMI Cloud usage (mandatory) | One GMI key drives LLM + image + TTS (+ music). Live "GMI calls" counter in UI. |
| Innovation (UpscaleX) | Self-critiquing multi-agent orchestration across modalities |
| Marketplace-ready (AgentBox) | Dockerized, deployable, with a "Hire this agent" listing |
| Demo polish (audience) | Premium UI, live agent control room, real downloadable output |

---

## 3. The product, scaled for 2 people

### The agents (all reasoning via GMI's OpenAI-compatible LLM)
1. **🎬 Creative Director (planner)** — turns the one-line brief into a structured creative plan:
   brand name, positioning, palette direction, and the exact prompts for every downstream asset.
2. **✍️ Copywriter** — landing headline/subhead/body/CTA, 3 social posts, and the ad script.
3. **🎨 Designer** — hero product image **and** a logo (2 image-model calls).
4. **🎙️ Voice** — a voiceover ad from the ad script (TTS).
5. **🎵 Composer** *(should-have)* — a short background jingle (music model).
6. **🧑‍⚖️ Art Director (critic)** — reviews the assembled kit against the brief, scores brand
   consistency (0–100) with notes, and triggers **one** revision round on the weakest asset.
   **This loop is our innovation centerpiece — protect it.**

### Output
A polished, shareable **Launch Kit**: logo + hero image + landing preview + 3 social posts +
voiceover ad (+ jingle), all downloadable as a bundle.

### Scope discipline (build in this order)
- **MUST (MVP):** brief → Creative Director plan → copy + hero image + voiceover → assembled kit.
  *(Most of this already exists — see §6.)*
- **SHOULD:** Art Director critic loop (1 revision) · logo generation · Download kit · AgentBox deploy.
- **STRETCH:** background jingle · voice brief input (speak the product) · short video teaser ·
  hosted shareable landing page.

> If we're behind at the freeze (§8), we ship MUST + as much of SHOULD as is solid. **Never** demo
> something half-working. Mock mode (§5) means we can always fall back to a flawless canned run.

---

## 4. Architecture

```
                       ┌─────────────────────────────────────────────┐
  Browser (Next.js)    │   Agent Control Room UI (Kenil)              │
  ──────────────────►  │   • brief input                             │
                       │   • live agent nodes + event feed           │
                       │   • assembled Launch Kit + download          │
                       └───────────────┬─────────────────────────────┘
                                       │  fetch /api/run (SSE events) + per-asset routes
                       ┌───────────────▼─────────────────────────────┐
  Server (Route        │   Orchestrator + Agents (Aarsh)             │
  Handlers, Node)      │   plan → [copy ∥ image ∥ logo ∥ voice ∥      │
                       │   music] → critique → (revise once)         │
                       └───────────────┬─────────────────────────────┘
                                       │  one key, many modalities
                       ┌───────────────▼─────────────────────────────┐
                       │   GMI Cloud (PRIMARY)                        │
                       │   LLM · image · TTS · music — one API key    │
                       │   Nebius (FALLBACK for LLM only)             │
                       └─────────────────────────────────────────────┘
```

- **Framework:** Next.js 16 (App Router, `src/`, TypeScript), React 19, Tailwind v4, framer-motion.
- **Provider strategy:** **GMI is primary for everything** (this is the mandatory, hero integration).
  Nebius is a **fallback for the LLM/text agents only** (burst capacity / if GMI errors). Every API
  response reports `provider` so the UI can show GMI-dominant badges and a live GMI-call counter.
- **Mock mode:** when `GMI_API_KEY` is blank, all endpoints return high-quality canned data so the
  UI and demo run with zero keys. This is also our demo-day safety net.

---

## 5. The integration contract (this is how we work in parallel)

Kenil (frontend) and Aarsh (backend) code against these shapes. **Agree/lock these in the first
15 minutes.** As long as the contract holds and mock mode returns it, both sides progress
independently and integrate at the checkpoints in §8.

### Shared types (`src/lib/types.ts` — owned by Aarsh, agreed by both)
```ts
export type SocialPost = { platform: "X" | "LinkedIn" | "Instagram"; text: string };

export type Plan = {
  brand: string;
  positioning: string;
  palette: string[];        // hex values, 3–5
  imagePrompt: string;
  logoPrompt: string;
  adScript: string;
  musicPrompt?: string;
};

export type Critique = {
  score: number;            // 0–100 brand-consistency
  notes: string;
  revisedAsset?: "copy" | "image" | "logo" | null;
};

export type LaunchKit = {
  plan: Plan;
  headline: string; subhead: string; body: string; cta: string;
  social: SocialPost[];
  heroUrl: string | null;
  logoUrl: string | null;
  audioUrl: string | null;
  musicUrl: string | null;
  critique: Critique | null;
};

export type AgentId = "director" | "copy" | "image" | "logo" | "voice" | "music" | "critic";
export type AgentStatus = "idle" | "working" | "done" | "error";
export type Provider = "GMI" | "Nebius" | "mock";

// Streamed over SSE from /api/run so the UI feed is live:
export type AgentEvent =
  | { type: "status"; agent: AgentId; status: AgentStatus; provider?: Provider; note?: string }
  | { type: "asset";  key: keyof LaunchKit; value: unknown; provider: Provider }
  | { type: "done";   kit: LaunchKit }
  | { type: "error";  agent?: AgentId; message: string };
```

### Endpoints (owned by Aarsh)
- `POST /api/run` — **orchestrator**, body `{ brief: string }`. Streams `AgentEvent`s (SSE / chunked).
  This drives the live UI. Internally: plan → parallel assets → critique → optional revise → `done`.
- Per-asset routes (also callable standalone, used for "regenerate this asset"):
  `POST /api/plan {brief}` · `POST /api/copy {plan}` · `POST /api/image {prompt}` ·
  `POST /api/logo {prompt}` · `POST /api/voice {script}` · `POST /api/music {prompt}` ·
  `POST /api/critique {kit}`
- `GET /api/status` — `{ mock: boolean, providers: { gmi: boolean, nebius: boolean } }`

> **Rule:** every endpoint must work in **mock mode** and return `provider`. Kenil builds the entire
> UI against mock data; Aarsh swaps in real GMI calls behind the same shapes.

---

## 6. Current state of the repo (what already works)

The MVP skeleton is **built, type-checks, and runs end-to-end in mock mode** (verified in the
browser preview). Files:

| Path | What it is | Status |
|---|---|---|
| `src/app/page.tsx` | Single-page UI: brief → 3 worker cards → launch kit | ✅ works (to be expanded by Kenil) |
| `src/lib/gmi.ts` | GMI client (LLM/image/TTS) + mock mode + WAV/SVG mock assets | ✅ works (Aarsh extends) |
| `src/lib/types.ts` | `Campaign`, `WorkerStatus` types | ✅ (Aarsh evolves to §5 shapes) |
| `src/app/api/{copy,image,voice,status}/route.ts` | per-asset + status routes | ✅ works |
| `next.config.ts` | `output: "standalone"` for Docker | ✅ |
| `Dockerfile`, `.dockerignore` | AgentBox-ready container | ✅ |
| `.env.local`, `.env.example` | env templates (mock when key blank) | ✅ |
| `README.md`, `CURSOR_PROMPT.md` | run/deploy docs + Cursor context | ✅ |

So we are **not** starting from zero — we're upgrading a working base into the scaled multi-agent
version. Reuse `src/lib/gmi.ts`'s patterns and mock-asset helpers.

---

## 7. GMI Cloud reference (verified)

Same `GMI_API_KEY` (Bearer) for all modalities.

| Modality | Endpoint | Default model | Result field |
|---|---|---|---|
| **LLM (text)** | `https://api.gmi-serving.com/v1/chat/completions` (OpenAI-compatible) | `deepseek-ai/DeepSeek-V3` | `choices[0].message.content` |
| **Image** | `https://console.gmicloud.ai/api/v1/ie/requestqueue/apikey/requests` | `seedream-4-0-250828` | `outcome.media_urls[0].url` |
| **TTS** | same IE endpoint | `inworld-tts-1.5-mini` | `outcome.audio_url` |
| **Music** | same IE endpoint | `minimax-music-2-5` | `outcome.audio_url` *(verify shape)* |

- Image body: `{ model, payload: { prompt, size, max_images, watermark, response_format:"url" } }`
- TTS body: `{ model, payload: { text, voice_id, audio_encoding:"MP3", sample_rate_hertz, speaking_rate, temperature } }`
- Model IDs are env-overridable; **confirm exact IDs in the GMI dashboard** once we have the key.
- **Nebius (fallback, LLM only):** OpenAI-compatible at `https://api.studio.nebius.com/v1/`,
  `NEBIUS_API_KEY`. Use only if GMI text call fails or for parallel burst. Keep GMI visually dominant.
- Docs: https://docs.gmicloud.ai · AgentBox: https://docs.gmicloud.ai/agentbox-marketplace/overview

---

## 8. Timeline & roles (protect the last hour for pitching)

Assumes afternoon build starts ~1:00 PM, **hard submit 4:30 PM**. We **freeze new features at
T-60 (~3:30 PM)** and spend the last hour integrating, deploying, rehearsing, and pitching.

| Time | Both | Kenil (Frontend/Product/Demo) | Aarsh (Agents/Inference/Infra) |
|---|---|---|---|
| **T0–0:15** | 🔒 Lock the §5 contract + types together | — | — |
| **0:15–1:30** | | Design direction (ui-ux-pro-max + frontend-design); build Agent Control Room shell against mock | GMI key live; extend `gmi.ts`; build Creative Director + `/api/plan` + `/api/run` SSE |
| **1:30–2:30** | Checkpoint #1: wire UI to `/api/run` | Launch Kit layout, animations (motion-framer), provider badges | Copy/image/logo/voice real calls + parallel orchestration; Nebius fallback |
| **2:30–3:15** | Checkpoint #2: full run end-to-end | Critic UI, download kit, responsive polish | Art Director critique + 1 revision loop; music (if time) |
| **3:15–3:30** | 🧊 **Feature freeze** | Demo screenshots, fix visual bugs | Deploy to AgentBox; smoke-test live |
| **3:30–4:30** | **Pitch hour:** rehearse 3-min demo, prep canned/mock fallback run, **submit**, then go pitch to audience | Owns pitch + deck (`slides` skill) | Owns "it works live" backup + AgentBox listing |

Detailed task lists: **`docs/TASKS_KENIL.md`** and **`docs/TASKS_AARSH.md`**.

---

## 9. The 3-minute pitch (Kenil leads, both present)

1. **Hook (20s):** "Launching a product takes a designer, a copywriter, a voice actor, and days.
   We built an agent you can *hire* to do all of it in 60 seconds." Type one line live.
2. **The magic (60s):** Watch the control room — Creative Director plans, specialists work in
   parallel, **all on one GMI key across image, text, and audio models.** Point at the live GMI counter.
3. **The innovation (40s):** The Art Director critic scores the kit and *sends one asset back for a
   redo* — show the score jump. "Our agents don't just produce; they critique and improve."
4. **The payoff (40s):** The finished launch kit — logo, hero, copy, social, play the voiceover.
   Download it. "It's deployed and hireable on AgentBox right now."
5. **Close (20s):** "Built on GMI Cloud. Launch Studio — hire the whole launch team." 

---

## 10. Setup & run

```bash
npm install
npm run dev        # http://localhost:3000  (runs in mock mode with no key)
```
- Add `GMI_API_KEY=...` (and optional `NEBIUS_API_KEY=...`) to `.env.local` to go live.
- Header pill shows **Demo mode** vs **Live · GMI**.
- Production/Docker: `npm run build`; container via `Dockerfile` (Next standalone) for AgentBox.

## 11. Risks & mitigations
- **GMI rate limits / model-ID mismatches** → env-overridable IDs; Nebius fallback for text; mock mode.
- **Live API flakiness during demo** → always keep a perfect **mock run** ready to present.
- **Scope creep** → strict MUST→SHOULD→STRETCH order; freeze at 3:30.
- **Image/audio latency** → run assets in parallel; show progressive reveal so waiting feels alive.

## 12. Toolkit (Claude Code skills installed for this project)
Design/taste: `ui-ux-pro-max`, `frontend-design`, `web-design-guidelines` · Motion: `motion-framer`,
`gsap-scrolltrigger` · Stack: `next-best-practices`, `react-best-practices`, `nextjs-seo`,
`cache-components`, `ai-app`, `ai-elements`, `ai-sdk-6`, `nextjs-shadcn`, `shadcn`, `openai-agents-sdk`
· Rigor: superpowers set (`writing-plans`, `systematic-debugging`, `test-driven-development`,
`verification-before-completion`, code-review skills, …) · Presentations: `slides`.
