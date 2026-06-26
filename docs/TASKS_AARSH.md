# 🧠 Aarsh — Agents, Inference & Infra Lead

> Read `docs/PROJECT_CONTEXT.md` first (esp. §5 contract, §6 current state, §7 GMI reference,
> §8 timeline). You own the brains: the multi-agent orchestration, all GMI/Nebius inference, and
> the AgentBox deploy. Your job is also to **keep mock mode working for every endpoint** so Kenil
> is never blocked.

## Your mission
Build the **self-correcting multi-agent pipeline** — plan → parallel specialists → critique →
revise — all on **one GMI key across modalities**, with Nebius as a text-only fallback, and ship it
to **AgentBox**.

## Files you own
- `src/lib/gmi.ts` (extend the existing client) and new `src/lib/nebius.ts`, `src/lib/agents.ts`
- `src/lib/types.ts` (you own it — lock §5 shapes with Kenil first)
- `src/app/api/**` (all route handlers)
- `Dockerfile`, `.env.local` / `.env.example`, AgentBox deploy

## Use these skills
`openai-agents-sdk` + `ai-sdk-6` (agent/orchestration patterns), `next-best-practices` (route
handlers, Node runtime, streaming), `react-best-practices` (avoid waterfalls), `systematic-debugging`,
`test-driven-development`, `verification-before-completion`.

## Task list (in order)

### Phase A — Foundations & planner (0:15 → 1:30)
- [ ] With Kenil: **lock §5 contract + write `src/lib/types.ts`** (15 min, first thing).
- [ ] Redeem the GMI key → `.env.local` as `GMI_API_KEY`; confirm exact model IDs in the dashboard
      and set `GMI_*_MODEL` env overrides if they differ from §7 defaults.
- [ ] Extend `src/lib/gmi.ts`: keep LLM/image/TTS; add `generateLogo` (image) and `generateMusic`.
      Every function returns `{ value, provider }`. **Preserve mock mode** for all of them (reuse the
      SVG/WAV mock helpers already in the file).
- [ ] Build the **Creative Director** (`src/lib/agents.ts`): brief → `Plan` JSON (brand, positioning,
      palette[], imagePrompt, logoPrompt, adScript, musicPrompt). Robust JSON parsing (strip
      `<think>`/code fences — pattern already in `gmi.ts`).
- [ ] `POST /api/plan {brief}` → `{ plan, provider }`.

### Phase B — Orchestrator + parallel specialists (1:30 → 2:30) — *Checkpoint #1 with Kenil*
- [ ] `POST /api/run {brief}` — **streaming** orchestrator (SSE / `ReadableStream`). Sequence:
  1. emit `status director working` → plan → emit plan + `director done`.
  2. fire **in parallel**: copy, image(hero), logo, voice, music — emit `status … working/done`
     and `asset` events as each resolves (`Promise.allSettled`, don't let one failure kill the run).
  3. assemble `LaunchKit` → go to critique (Phase C).
- [ ] Standalone per-asset routes (for "regenerate"): `/api/copy {plan}`, `/api/image {prompt}`,
      `/api/logo {prompt}`, `/api/voice {script}`, `/api/music {prompt}`.
- [ ] **Nebius fallback** (`src/lib/nebius.ts`, OpenAI-compatible): wrap LLM calls so a GMI text
      failure (or timeout) retries on Nebius; tag `provider` accordingly. **GMI stays primary** —
      Nebius only on failure/burst. Image/TTS/music stay GMI-only.
- [ ] Update `GET /api/status` → `{ mock, providers: { gmi, nebius } }`.

### Phase C — The critic loop (2:30 → 3:15) — *Checkpoint #2 — our innovation*
- [ ] **Art Director** agent: input the assembled `LaunchKit`, output `Critique`
      `{ score 0–100, notes, revisedAsset }` judging brand/palette/positioning consistency.
- [ ] If `score < 80` (tune), **revise the weakest asset once**: regenerate copy or image/logo with
      the critique notes injected into the prompt, recompute score, emit events so the UI can animate
      the score going up. Cap at **one** revision (time-box).
- [ ] `POST /api/critique {kit}` standalone; integrate into `/api/run` before `done`.
- [ ] Emit final `{ type: "done", kit }`.

### Phase D — Deploy & harden (3:15 → 4:30)
- [ ] 🧊 Freeze logic. `npm run build` clean (TypeScript + lint).
- [ ] **Deploy to AgentBox**: build container (Dockerfile is ready), set `GMI_API_KEY` (+ `NEBIUS_API_KEY`)
      as env in the deploy wizard; get the public URL; smoke-test the live run.
- [ ] Create the AgentBox **listing** (name, description, "hire" copy) — marketplace-ready.
- [ ] Keep the live URL **and** confirm local mock run both work as demo fallbacks.

## Definition of done (your side)
- `POST /api/run` streams a full plan→assets→critique→revise→done sequence with `provider` on each.
- All modalities served by **GMI on one key**; Nebius only catches text failures.
- Every endpoint works in mock mode (Kenil can build with no key).
- App is deployed on AgentBox with a public URL + listing.

## Integration notes
- The §5 contract is law. If a shape must change, change `types.ts` **with Kenil**, not silently.
- Run assets in parallel to keep latency low; `Promise.allSettled` so partial failures still yield a kit.
- Test each route with a quick `curl`/REST call before telling Kenil it's ready.

## Stretch (only after SHOULD is solid)
- Short **video teaser** via a GMI video model (adds a 4th modality to the "one key" story).
- Persist runs (so the demo can replay a great result instantly).
- Per-asset cost/latency telemetry in the event stream (nice "ops" flavor).
