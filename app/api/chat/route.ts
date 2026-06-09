import { NextRequest } from "next/server";

const GEMINI_KEY = process.env.GEMINI_API_KEY ?? "";
const GAS_URL = process.env.NEXT_PUBLIC_GAS_WEB_APP_URL ?? "";
const MODEL = "gemini-2.5-flash";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Campaign {
  rowIndex: number;
  pic: string;
  picSupport: string;
  bdName: string;
  agencyName: string;
  campaignName: string;
  stage: string;
  status: string;
  urgent: string;
  budget: string;
  revenueSize: string;
  dateRequest: string;
  timeline: string;
  categoryFolder: string;
  platformDetails: string;
  kolRequirement: string;
  copywriting: string;
  totalPax: string;
  filledPax: string;
  specialRemarks: string;
  zynnApproval: string;
  telegramPosted: string;
  emailBlasted: string;
  fbGroupPosted: string;
  statusUpdatedAt: string;
  clientSheetLink: string;
}

interface KolEntry {
  rowIndex: number;
  name: string;
  profileLink: string;
  followers: string;
  interestCheckClient: string;
  interestCheckKol: string;
  ytRemarks: string;
  clientRemarks: string;
}

// ─── GAS helpers ──────────────────────────────────────────────────────────────

async function fetchCampaigns(): Promise<Campaign[]> {
  if (!GAS_URL) return [];
  try {
    const res = await fetch(`${GAS_URL}?action=getCampaigns`, { cache: "no-store" });
    const text = await res.text();
    // GAS sometimes returns an HTML error page on auth / redirect issues.
    if (!text.trim().startsWith("{")) {
      console.error("fetchCampaigns: GAS returned non-JSON:", text.substring(0, 200));
      return [];
    }
    const json = JSON.parse(text);
    return json.success ? (json.data as Campaign[]) : [];
  } catch (e) {
    console.error("fetchCampaigns failed:", e);
    return [];
  }
}

/** Extract the sheet ID from a Google Sheets URL. Mirrors lib/utils.ts. */
function extractSheetId(url: string): string {
  if (!url) return "";
  const matchD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD) return matchD[1];
  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId) return matchId[1];
  if (/^[a-zA-Z0-9_-]{25,}$/.test(url.trim())) return url.trim();
  return "";
}

async function fetchKolListForCampaign(campaign: Campaign): Promise<KolEntry[]> {
  const sheetId = extractSheetId(campaign.clientSheetLink);
  if (!sheetId || !GAS_URL) return [];
  try {
    const url = `${GAS_URL}?action=getKolList&clientSheetId=${encodeURIComponent(sheetId)}&campaignRowIndex=${campaign.rowIndex}`;
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    if (!text.trim().startsWith("{")) {
      console.error("fetchKolListForCampaign: non-JSON:", text.substring(0, 200));
      return [];
    }
    const json = JSON.parse(text);
    return json.success ? (json.data as KolEntry[]) : [];
  } catch (e) {
    console.error("fetchKolListForCampaign failed:", e);
    return [];
  }
}

// ─── Context builders ─────────────────────────────────────────────────────────

function compactCampaign(c: Campaign): string {
  const pax = c.totalPax ? `pax:${c.filledPax || 0}/${c.totalPax}` : "";
  const copy = c.copywriting ? `copy:"${c.copywriting.replace(/\s+/g, " ").slice(0, 60)}${c.copywriting.length > 60 ? "…" : ""}"` : "";
  const parts = [
    `#${c.rowIndex}`,
    c.campaignName,
    c.agencyName && `agency:${c.agencyName}`,
    c.pic && `pic:${c.pic}`,
    c.picSupport && `support:${c.picSupport}`,
    c.bdName && `bd:${c.bdName}`,
    c.status && `status:${c.status}`,
    c.statusUpdatedAt && `statusUpdated:${c.statusUpdatedAt}`,
    c.stage && `stage:${c.stage}`,
    c.urgent && `urgent:${c.urgent}`,
    c.budget && `budget:${c.budget}`,
    c.dateRequest && `requested:${c.dateRequest}`,
    c.timeline && `timeline:${c.timeline}`,
    c.categoryFolder && `categoryFolder:${c.categoryFolder}`,
    pax,
    c.zynnApproval && `zynn:${c.zynnApproval}`,
    c.specialRemarks && `remarks:${c.specialRemarks}`,
    c.clientSheetLink && "hasClientSheet:yes",
    copy,
  ].filter(Boolean);
  return parts.join(" | ");
}

function buildSummary(campaigns: Campaign[]): string {
  const total = campaigns.length;
  const byStatus: Record<string, number> = {};
  const byPic: Record<string, number> = {};
  const byBd: Record<string, number> = {};
  let asapCount = 0;
  let unassignedCount = 0;
  let pendingZynnCount = 0;

  for (const c of campaigns) {
    const s = c.status || "Unset";
    byStatus[s] = (byStatus[s] ?? 0) + 1;
    if (c.pic?.trim()) byPic[c.pic] = (byPic[c.pic] ?? 0) + 1;
    else unassignedCount++;
    if (c.bdName?.trim()) byBd[c.bdName] = (byBd[c.bdName] ?? 0) + 1;
    if (c.urgent?.toLowerCase() === "asap") asapCount++;
    if (!c.zynnApproval) pendingZynnCount++;
  }

  const fmt = (obj: Record<string, number>) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}=${v}`)
      .join(", ");

  return [
    `Total campaigns: ${total}`,
    `Unassigned (no PIC): ${unassignedCount}`,
    `ASAP / Urgent: ${asapCount}`,
    `Pending Zynn approval: ${pendingZynnCount}`,
    `By status: ${fmt(byStatus)}`,
    `Active workload by PIC: ${fmt(byPic)}`,
    `By BD: ${fmt(byBd)}`,
  ].join("\n");
}

/**
 * Top N most recently changed campaigns, sorted by statusUpdatedAt desc.
 * Lets the model answer "what's been updated recently?" without scanning everything.
 */
function buildRecentActivity(campaigns: Campaign[], n = 20): string {
  const dated = campaigns
    .filter((c) => c.statusUpdatedAt)
    .sort((a, b) => (b.statusUpdatedAt || "").localeCompare(a.statusUpdatedAt || ""))
    .slice(0, n);
  if (dated.length === 0) return "(No status updates timestamped yet.)";
  return dated
    .map(
      (c) =>
        `${c.statusUpdatedAt}  #${c.rowIndex} ${c.campaignName}  →  ${c.status || "Unset"}  (PIC: ${c.pic || "—"})`
    )
    .join("\n");
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the AI assistant for the YouthsToday KOL Research Dashboard, used by the BD team and research interns to track Key Opinion Leader marketing campaigns.

Your three jobs:
1. **Answer questions** about campaigns using the live data block below. Be precise, cite campaign names + rowIndex when relevant, give counts when asked. If the data doesn't contain what they asked, say so.
2. **Draft copywriting** when asked — outreach DMs to KOLs, captions, follow-up emails. Match YouthsToday's warm friendly tone (e.g. "Hi 😊  I'm [Name] from YouthsToday…"). Output ONLY the message body — no intros like "Here's the draft:".
3. **Look up KOL details** for a specific campaign by calling the \`getKolList\` tool when the user asks about specific influencers, KOL queries/questions, follower counts, or interest-check status on a campaign. The tool returns each KOL's profile link, follower count, interest check (Client + KOL), internal remarks, and any client-side queries.

Style guide:
- Be concise. Use **bold** for key numbers/names. Use bullet lists for multiple items.
- Format campaign references as: \`#rowIndex – Campaign Name (PIC, Status)\`
- For "what's been updated recently", use the RECENT ACTIVITY block below — it lists the 20 most-recently-changed campaigns sorted by statusUpdatedAt desc.
- For KOL queries, call \`getKolList\` then summarize each KOL who has non-empty \`clientRemarks\` (those are the queries from KOLs to us).

Key terms:
- PIC = Person In Charge (research intern). BD = Business Development.
- Status: pipeline state (Request Assign → Done Reach Out → Client Feedback → Approved/Done).
- Stage: profile-list maturity (Sample Profile → Interest Check).
- Pax: target seeders. filledPax: already added to the client sheet.
- "Client Sheet" / "Profile Sheet": the per-campaign Google Sheet where KOLs are tracked.

You can't write to the sheet yet (no status changes, no PIC assignment). If asked, tell them to use the dashboard UI directly.`;

// ─── Tool definitions for Gemini function-calling ─────────────────────────────

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "getKolList",
        description:
          "Fetch the list of KOLs/seeders on a specific campaign's client sheet. Returns each KOL's name, TikTok profile link, follower count, interest-check status (client and KOL sides), internal remarks (col G), and any queries/questions the KOL or client raised (col H). Use this when the user asks about KOLs on a specific campaign, KOL queries, follower counts, or who has confirmed interest.",
        parameters: {
          type: "object",
          properties: {
            campaignRowIndex: {
              type: "integer",
              description: "The rowIndex of the campaign on the Research sheet (1-based, e.g. 6 for Magnolia Threads).",
            },
          },
          required: ["campaignRowIndex"],
        },
      },
    ],
  },
];

// ─── Function execution ───────────────────────────────────────────────────────

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  campaigns: Campaign[]
): Promise<unknown> {
  if (name === "getKolList") {
    const rowIndex = Number(args.campaignRowIndex);
    const campaign = campaigns.find((c) => c.rowIndex === rowIndex);
    if (!campaign) return { error: `No campaign at rowIndex ${rowIndex}` };
    if (!campaign.clientSheetLink) {
      return {
        error: `Campaign #${rowIndex} (${campaign.campaignName}) has no client sheet yet — KOLs cannot be listed.`,
      };
    }
    const kols = await fetchKolListForCampaign(campaign);
    return {
      campaign: `#${rowIndex} ${campaign.campaignName}`,
      totalKols: kols.length,
      kols: kols.map((k) => ({
        name: k.name,
        followers: k.followers,
        profileLink: k.profileLink,
        interestCheckClient: k.interestCheckClient,
        interestCheckKol: k.interestCheckKol,
        internalRemark: k.ytRemarks,
        kolQuery: k.clientRemarks,
      })),
    };
  }
  return { error: `Unknown tool: ${name}` };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: unknown };
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

export async function POST(req: NextRequest) {
  if (!GEMINI_KEY) {
    return Response.json(
      { success: false, error: "GEMINI_API_KEY not set on server" },
      { status: 500 }
    );
  }

  let body: { messages: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (messages.length === 0) {
    return Response.json({ success: false, error: "No messages provided" }, { status: 400 });
  }

  // Pull live campaign data once and reuse across any tool calls in this turn.
  const campaigns = await fetchCampaigns();
  if (campaigns.length === 0) {
    return Response.json({
      success: true,
      reply:
        "I can't reach the campaign data right now — Google Apps Script took too long to respond (rate limit or temporary error). Try again in a minute.",
    });
  }
  const summary = buildSummary(campaigns);
  const recent = buildRecentActivity(campaigns, 20);
  const compactList = campaigns.map(compactCampaign).join("\n");

  const contextBlock = `=== DASHBOARD SNAPSHOT (live) ===\n\n${summary}\n\n=== RECENT ACTIVITY (last 20 status changes) ===\n${recent}\n\n=== CAMPAIGN LIST (${campaigns.length} rows) ===\n${compactList}`;

  // Build the Gemini contents from chat history
  const contents: GeminiContent[] = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;
  const systemInstruction = { parts: [{ text: `${SYSTEM_PROMPT}\n\n${contextBlock}` }] };

  // Tool-calling loop — Gemini may call getKolList one or more times before final text.
  const MAX_TOOL_HOPS = 4;
  let lastFinishReason = "";

  try {
    for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
      const payload = {
        systemInstruction,
        contents,
        tools: TOOLS,
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
      };

      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        return Response.json(
          { success: false, error: `Gemini error (${res.status}): ${errText.substring(0, 300)}` },
          { status: 500 }
        );
      }

      const data = await res.json();
      const candidate = data?.candidates?.[0];
      const parts: GeminiPart[] = candidate?.content?.parts ?? [];
      lastFinishReason = candidate?.finishReason ?? "";

      // If any part is a functionCall, execute all of them and continue the loop.
      const fnCalls = parts.filter((p) => p.functionCall);
      if (fnCalls.length > 0) {
        // Echo the model's reply (the function calls) back into the conversation
        contents.push({ role: "model", parts });
        // Execute each tool and append the responses
        const responseParts: GeminiPart[] = [];
        for (const p of fnCalls) {
          const fc = p.functionCall!;
          const result = await executeTool(fc.name, fc.args ?? {}, campaigns);
          responseParts.push({
            functionResponse: { name: fc.name, response: result as Record<string, unknown> },
          });
        }
        contents.push({ role: "user", parts: responseParts });
        continue;
      }

      // No more tool calls — assemble final text and return.
      let reply = parts.map((p) => p.text ?? "").join("") ||
        "(No response generated — try rephrasing your question.)";
      if (lastFinishReason === "MAX_TOKENS") {
        reply += "\n\n*(Response was truncated — ask for a shorter list or be more specific.)*";
      } else if (lastFinishReason === "SAFETY") {
        reply = "(The model declined to answer this — try rephrasing.)";
      }
      return Response.json({ success: true, reply });
    }

    return Response.json({
      success: true,
      reply: "(The model kept asking for more data — please rephrase the question more narrowly.)",
    });
  } catch (e) {
    return Response.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
