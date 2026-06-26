import { NextRequest } from "next/server";
import { generateImage, generateVoice, generateMusic, type Result } from "@/lib/gmi";
import { generatePlan, generateCopy, critique } from "@/lib/agents";
import type { AgentEvent, AgentId, AgentStatus, LaunchKit, Provider } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Orchestrator. Streams newline-delimited AgentEvent JSON:
 *   director → [copy ∥ image ∥ logo ∥ voice ∥ music] → critic → (revise once) → done
 */
export async function POST(req: NextRequest) {
  const { brief } = await req.json().catch(() => ({ brief: "" }));

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (e: AgentEvent) => controller.enqueue(enc.encode(JSON.stringify(e) + "\n"));
      const status = (agent: AgentId, s: AgentStatus, provider?: Provider, note?: string) =>
        send({ type: "status", agent, status: s, provider, note });

      try {
        if (!brief || typeof brief !== "string") throw new Error("Missing brief");

        // 1) Creative Director plans the whole kit.
        status("director", "working");
        send({ type: "log", agent: "director", message: "Reading the brief and shaping a creative plan…" });
        const planR = await generatePlan(brief);
        const plan = planR.value;
        send({ type: "asset", key: "plan", value: plan, provider: planR.provider });
        send({ type: "log", agent: "director", message: `Brand: "${plan.brand}" — ${plan.positioning}` });
        status("director", "done", planR.provider);

        const kit: LaunchKit = {
          plan, headline: "", subhead: "", body: "", cta: "", social: [],
          heroUrl: null, logoUrl: null, audioUrl: null, musicUrl: null, critique: null,
        };

        // 2) Specialists work in parallel; events stream as each finishes.
        for (const a of ["copy", "image", "logo", "voice", "music"] as const) status(a, "working");

        const tasks: Promise<void>[] = [];

        tasks.push(
          run(() => generateCopy(plan), (r) => {
            Object.assign(kit, r.value);
            send({ type: "asset", key: "headline", value: r.value.headline, provider: r.provider });
            send({ type: "asset", key: "social", value: r.value.social, provider: r.provider });
            status("copy", "done", r.provider);
          }, "copy", send)
        );
        tasks.push(
          run(() => generateImage(plan.imagePrompt, "hero"), (r) => {
            kit.heroUrl = r.value;
            send({ type: "asset", key: "heroUrl", value: r.value, provider: r.provider });
            status("image", "done", r.provider);
          }, "image", send)
        );
        tasks.push(
          run(() => generateImage(plan.logoPrompt, "logo"), (r) => {
            kit.logoUrl = r.value;
            send({ type: "asset", key: "logoUrl", value: r.value, provider: r.provider });
            status("logo", "done", r.provider);
          }, "logo", send)
        );
        tasks.push(
          run(() => generateVoice(plan.adScript), (r) => {
            kit.audioUrl = r.value;
            send({ type: "asset", key: "audioUrl", value: r.value, provider: r.provider });
            status("voice", "done", r.provider);
          }, "voice", send)
        );
        tasks.push(
          run(() => generateMusic(plan.musicPrompt), (r) => {
            kit.musicUrl = r.value;
            send({ type: "asset", key: "musicUrl", value: r.value, provider: r.provider });
            status("music", "done", r.provider);
          }, "music", send)
        );

        await Promise.allSettled(tasks);

        // 3) Art Director critiques and (once) revises the weakest asset.
        status("critic", "working");
        send({ type: "log", agent: "critic", message: "Reviewing the kit for brand consistency…" });
        const critR = await critique(kit);
        kit.critique = critR.value;
        send({ type: "log", agent: "critic", message: `Score ${critR.value.score}/100 — ${critR.value.notes}` });

        if (critR.value.revisedAsset && critR.value.score < 85) {
          const asset = critR.value.revisedAsset;
          send({ type: "log", agent: "critic", message: `Sending the ${asset} back for one revision…` });
          if (asset === "copy") {
            const r = await generateCopy(plan, critR.value.notes);
            Object.assign(kit, r.value);
            send({ type: "asset", key: "headline", value: r.value.headline, provider: r.provider });
            send({ type: "asset", key: "social", value: r.value.social, provider: r.provider });
          } else if (asset === "image") {
            const r = await generateImage(plan.imagePrompt + " — refined, premium", "hero", plan.imagePrompt + "v2");
            kit.heroUrl = r.value;
            send({ type: "asset", key: "heroUrl", value: r.value, provider: r.provider });
          } else if (asset === "logo") {
            const r = await generateImage(plan.logoPrompt + " — refined", "logo", plan.logoPrompt + "v2");
            kit.logoUrl = r.value;
            send({ type: "asset", key: "logoUrl", value: r.value, provider: r.provider });
          }
          const reR = await critique(kit);
          kit.critique = reR.value;
          send({ type: "log", agent: "critic", message: `Revised score ${reR.value.score}/100 — ${reR.value.notes}` });
        }
        send({ type: "asset", key: "critique", value: kit.critique, provider: critR.provider });
        status("critic", "done", critR.provider);

        send({ type: "done", kit });
      } catch (e) {
        send({ type: "error", message: (e as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

async function run<T>(
  fn: () => Promise<Result<T>>,
  onOk: (r: Result<T>) => void,
  agent: "copy" | "image" | "logo" | "voice" | "music",
  send: (e: AgentEvent) => void
): Promise<void> {
  try {
    onOk(await fn());
  } catch (e) {
    send({ type: "status", agent, status: "error", note: (e as Error).message });
    send({ type: "log", agent, message: `Failed: ${(e as Error).message}` });
  }
}
