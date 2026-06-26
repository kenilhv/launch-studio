# 🎨 Kenil — Frontend, Product & Demo Lead

> Read `docs/PROJECT_CONTEXT.md` first (esp. §5 contract, §6 current state, §8 timeline, §9 pitch).
> You own everything the audience sees and the pitch. You can build the **entire** UI against
> **mock mode** without waiting on Aarsh — that's the whole point of the contract.

## Your mission
Turn the working MVP UI into a **premium "Agent Control Room"** that makes the multi-agent magic
*visible*, then assemble the gorgeous **Launch Kit** output, and own the 3-minute pitch.

## Files you own
- `src/app/page.tsx` (and new components under `src/components/`)
- `src/app/globals.css`, theme/design tokens
- `src/app/layout.tsx` (metadata, fonts)
- Demo assets + the pitch deck (use the `slides` skill)
- Shared, but **agree don't edit unilaterally:** `src/lib/types.ts` (Aarsh owns; lock §5 together first)

## Use these skills
`ui-ux-pro-max` (lock palette/typography/style), `frontend-design` (distinctive, non-templated look),
`motion-framer` + `gsap-scrolltrigger` (animation), `web-design-guidelines` (a11y/quality pass),
`nextjs-shadcn`/`shadcn` (components), `slides` (pitch deck).

## Task list (in order)

### Phase A — Direction & shell (0:15 → 1:30)
- [ ] With Aarsh: **lock the §5 contract + `types.ts`** (15 min, do this first).
- [ ] Run `ui-ux-pro-max` + `frontend-design`: pick ONE bold aesthetic direction, palette, and a
      distinctive font pairing (avoid Inter/Arial defaults). Commit it to `globals.css` as CSS vars.
- [ ] Build the **Agent Control Room** shell against mock data:
  - [ ] Brief input (with voice-input affordance stub for stretch) + example chips.
  - [ ] 6 **agent nodes**: Creative Director, Copywriter, Designer, Voice, Composer, Art Director —
        each with avatar, role/model label, and `idle/working/done/error` states.
  - [ ] A **live event feed** that renders `AgentEvent` messages (the "agents talking" log).
  - [ ] A persistent **stat bar**: "⚡ N GMI calls · 1 key · 3+ model types" + provider badges.

### Phase B — Wire to the orchestrator (1:30 → 2:30) — *Checkpoint #1 with Aarsh*
- [ ] Consume `POST /api/run` as a **stream** (SSE/`ReadableStream`); update nodes + feed from
      `AgentEvent`s in real time. Keep a non-streaming fallback that polls per-asset routes.
- [ ] Build the **Launch Kit** presentation:
  - [ ] Landing preview (logo + hero image + headline/subhead/body/CTA, palette-themed).
  - [ ] 3 social post cards.
  - [ ] Audio player for the voiceover (+ music when available).
  - [ ] Progressive reveal animations as each asset arrives (motion-framer).

### Phase C — Innovation surface & polish (2:30 → 3:15) — *Checkpoint #2*
- [ ] **Art Director critic UI** — show the brand-consistency **score**, the critique notes, and a
      visible "revised ✦" badge on the asset it sent back. *(This is our UpscaleX differentiator —
      make it obvious and satisfying, e.g. score animates up after the revision.)*
- [ ] **Download kit** button — bundle copy (.md) + images + audio into a zip (client-side `jszip`),
      or a "Copy all" + individual downloads if zip is fiddly.
- [ ] "Hire this agent on AgentBox" CTA + a small marketplace-style listing card.
- [ ] Responsive + dark, `web-design-guidelines` pass, fix contrast/focus states.

### Phase D — Freeze & pitch (3:15 → 4:30)
- [ ] 🧊 Freeze UI. Capture clean screenshots (use the preview tools).
- [ ] Prepare the pitch deck (`slides`) following §9; rehearse the 3-min demo **twice**.
- [ ] Rehearse with **mock mode** as the guaranteed-perfect run; know how to toggle to live.
- [ ] Confirm the demo machine + screen/audio works at the venue.

## Definition of done (your side)
- One-line brief → control room animates → full launch kit assembles → voiceover plays → download works.
- Looks unmistakably premium and *not* like a template. GMI is visually front-and-center.
- Runs flawlessly in **mock mode** with zero backend dependency.

## Integration notes
- Code against §5 shapes; never block on Aarsh — mock returns the same shapes.
- If you need a field that's not in the contract, ping Aarsh and add it to `types.ts` **together**.
- Verify changes in the browser preview (don't ask anyone to "check manually").

## Stretch (only after SHOULD is solid)
- Voice brief input (Web Speech API → text).
- Shareable launch-kit permalink.
- Subtle GSAP scroll storytelling on the landing preview.
