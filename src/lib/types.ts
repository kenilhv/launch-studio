export type SocialPost = { platform: "X" | "LinkedIn" | "Instagram"; text: string };

export type Plan = {
  brand: string;
  positioning: string;
  palette: string[]; // 3–5 hex values
  imagePrompt: string;
  logoPrompt: string;
  adScript: string;
  musicPrompt: string;
};

export type Critique = {
  score: number; // 0–100 brand-consistency
  notes: string;
  revisedAsset: "copy" | "image" | "logo" | null;
};

export type LaunchKit = {
  plan: Plan;
  headline: string;
  subhead: string;
  body: string;
  cta: string;
  social: SocialPost[];
  heroUrl: string | null;
  logoUrl: string | null;
  audioUrl: string | null;
  musicUrl: string | null;
  critique: Critique | null;
};

export type AgentId =
  | "director"
  | "copy"
  | "image"
  | "logo"
  | "voice"
  | "music"
  | "critic";

export type AgentStatus = "idle" | "working" | "done" | "error";
export type Provider = "GMI" | "Nebius" | "mock";

/** Newline-delimited JSON events streamed from POST /api/run. */
export type AgentEvent =
  | { type: "status"; agent: AgentId; status: AgentStatus; provider?: Provider; note?: string }
  | { type: "asset"; key: keyof LaunchKit; value: unknown; provider: Provider }
  | { type: "log"; agent: AgentId; message: string }
  | { type: "done"; kit: LaunchKit }
  | { type: "error"; agent?: AgentId; message: string };
