import { chat, type Result } from "./gmi";
import type { Plan, Critique, LaunchKit, SocialPost } from "./types";

// ---------------------------------------------------------------------------
// 🎬 Creative Director — brief → structured creative plan
// ---------------------------------------------------------------------------

const DIRECTOR_SYS = `You are a Creative Director at a top brand studio. Given a one-line product brief,
produce a tight creative plan as STRICT JSON:
{
  "brand": string,            // short brand/product name
  "positioning": string,      // one-sentence positioning statement
  "palette": string[],        // 3-5 hex colors that fit the brand
  "imagePrompt": string,      // vivid prompt for a photorealistic, studio-lit hero product image
  "logoPrompt": string,       // prompt for a clean, modern vector-style logo
  "adScript": string,         // warm 2-sentence voiceover ad script
  "musicPrompt": string       // short description of a fitting background music bed
}
JSON only. No markdown, no commentary.`;

export async function generatePlan(brief: string): Promise<Result<Plan>> {
  const r = await chat(DIRECTOR_SYS, `Product brief: ${brief}`, {
    json: true,
    mock: () => mockPlan(brief),
  });
  const p = r.value as Plan;
  p.palette = (p.palette ?? []).slice(0, 5);
  return { value: p, provider: r.provider };
}

// ---------------------------------------------------------------------------
// ✍️ Copywriter — plan → landing copy + social posts
// ---------------------------------------------------------------------------

type Copy = {
  headline: string; subhead: string; body: string; cta: string; social: SocialPost[];
};

const COPY_SYS = `You are a world-class copywriter. Given a creative plan, write launch copy as STRICT JSON:
{
  "headline": string,        // punchy hero headline, <= 8 words
  "subhead": string,         // supporting line, <= 18 words
  "body": string,            // 2-3 sentence landing paragraph
  "cta": string,             // button label, <= 4 words
  "social": [
    {"platform":"X","text":string},
    {"platform":"LinkedIn","text":string},
    {"platform":"Instagram","text":string}
  ]
}
JSON only.`;

export async function generateCopy(plan: Plan, note?: string): Promise<Result<Copy>> {
  const user = `Plan: ${JSON.stringify(plan)}${note ? `\nArt Director revision note: ${note}` : ""}`;
  const r = await chat(COPY_SYS, user, { json: true, mock: () => mockCopy(plan) });
  const c = r.value as Copy;
  c.social = (c.social ?? []).slice(0, 3);
  return { value: c, provider: r.provider };
}

// ---------------------------------------------------------------------------
// 🧑‍⚖️ Art Director — critique the assembled kit (the self-correction loop)
// ---------------------------------------------------------------------------

const CRITIC_SYS = `You are a meticulous Art Director reviewing a product launch kit for brand consistency,
clarity, and impact. Return STRICT JSON:
{
  "score": number,                       // 0-100 overall brand-consistency/quality
  "notes": string,                       // one sentence: the single most useful improvement
  "revisedAsset": "copy" | "image" | "logo" | null  // which ONE asset to regenerate, or null if great
}
Be honest but constructive. JSON only.`;

export async function critique(kit: LaunchKit): Promise<Result<Critique>> {
  const summary = {
    brand: kit.plan.brand,
    positioning: kit.plan.positioning,
    headline: kit.headline,
    subhead: kit.subhead,
    body: kit.body,
    social: kit.social,
  };
  const r = await chat(CRITIC_SYS, `Launch kit: ${JSON.stringify(summary)}`, {
    json: true,
    mock: () => mockCritique(),
  });
  return { value: r.value as Critique, provider: r.provider };
}

// ---------------------------------------------------------------------------
// Mock outputs (used when no GMI key — keeps the whole demo runnable)
// ---------------------------------------------------------------------------

function mockPlan(brief: string): Plan {
  const brand = brief.split(/[,.\n]/)[0].trim().slice(0, 26) || "Your Product";
  return {
    brand,
    positioning: `${brand} makes the hard part effortless — designed for people who refuse to settle.`,
    palette: ["#0A0A0C", "#D4F23C", "#FF5A2C", "#F4F4EF", "#8C8C84"],
    imagePrompt: `Studio product photograph of ${brief}, dramatic rim lighting, clean gradient backdrop, ultra-detailed, 8k`,
    logoPrompt: `Minimal modern vector logo for "${brand}", geometric, high contrast, monochrome with a single accent`,
    adScript: `Introducing ${brand}. The smarter, simpler way forward — available today.`,
    musicPrompt: `Confident, modern electronic bed with a warm pulse, 8 seconds, upbeat but premium`,
  };
}

function mockCopy(plan: Plan): Copy {
  const b = plan.brand;
  return {
    headline: `Meet ${b}.`,
    subhead: `The effortless way to get more done, beautifully.`,
    body: `${b} reimagines the everyday. Thoughtful engineering meets a finish you'll want to show off — the upgrade you didn't know you needed.`,
    cta: "Get yours",
    social: [
      { platform: "X", text: `${b} is here. The wait is over. 🚀` },
      { platform: "LinkedIn", text: `Excited to introduce ${b} — built to make the hard parts effortless. Here's why it matters 👇` },
      { platform: "Instagram", text: `New drop ✨ ${b}. Tap the link in bio to be first.` },
    ],
  };
}

let mockCritiqueCall = 0;
function mockCritique(): Critique {
  // First pass flags a fixable issue; after revision the score jumps (shows the loop working).
  mockCritiqueCall++;
  if (mockCritiqueCall % 2 === 1) {
    return { score: 74, notes: "Headline is generic — sharpen it to lead with the core benefit.", revisedAsset: "copy" };
  }
  return { score: 92, notes: "Cohesive, on-brand, and punchy. Ready to ship.", revisedAsset: null };
}
