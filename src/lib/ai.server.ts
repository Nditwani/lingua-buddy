const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-5.6-sol";

export type AiCall = {
  system: string;
  prompt: string;
  schema?: { name: string; schema: Record<string, unknown> };
  effort?: "low" | "medium";
};

/**
 * Calls the Lovable AI Gateway Responses API in streaming mode and returns the
 * accumulated text. Streaming is required: reasoning runs can take minutes.
 */
export async function callAi({ system, prompt, schema, effort = "low" }: AiCall): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured (missing key).");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      instructions: system,
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      reasoning: { effort, summary: "auto" },
      ...(schema
        ? {
            text: {
              format: {
                type: "json_schema",
                name: schema.name,
                strict: true,
                schema: schema.schema,
              },
            },
          }
        : {}),
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("The AI is busy right now — please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits are exhausted. Please add credits to continue.");
    throw new Error(`AI request failed (${res.status}). ${detail.slice(0, 300)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
          text += evt.delta;
        } else if (evt.type === "response.completed" && !text && evt.response?.output_text) {
          text = evt.response.output_text;
        }
      } catch {
        /* ignore malformed chunk */
      }
    }
  }

  return text.trim();
}

export async function callAiJson<T>(call: AiCall & { schema: { name: string; schema: Record<string, unknown> } }): Promise<T> {
  const raw = await callAi(call);
  if (!raw) throw new Error("The AI returned an empty response. Please try again.");
  return JSON.parse(raw) as T;
}

/** Shared context block used by every prompt — practical prompt engineering. */
export function studentContextBlock(ctx: {
  name: string;
  level: string;
  industry: string;
  goals: string;
  recentMistakes?: string[];
  recentVocab?: string[];
  recentTopics?: string[];
}): string {
  return [
    "STUDENT CONTEXT",
    `- Name: ${ctx.name}`,
    `- CEFR level: ${ctx.level}`,
    `- Industry / field: ${ctx.industry}`,
    `- Learning goals: ${ctx.goals || "not provided"}`,
    `- Recent mistakes: ${ctx.recentMistakes?.length ? ctx.recentMistakes.join(" | ") : "none recorded"}`,
    `- Recent vocabulary: ${ctx.recentVocab?.length ? ctx.recentVocab.join(", ") : "none recorded"}`,
    `- Recent lesson topics: ${ctx.recentTopics?.length ? ctx.recentTopics.join(", ") : "none recorded"}`,
  ].join("\n");
}