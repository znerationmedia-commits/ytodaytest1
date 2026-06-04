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
  category: string;
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
}

/** Fetch the full campaign list from GAS so the model has up-to-date context. */
async function fetchCampaigns(): Promise<Campaign[]> {
  if (!GAS_URL) return [];
  const url = `${GAS_URL}?action=getCampaigns`;
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  return json.success ? (json.data as Campaign[]) : [];
}

/** Compact each campaign into a single line so the context stays small. */
function compactCampaign(c: Campaign): string {
  const pax = c.totalPax ? `pax:${c.filledPax || 0}/${c.totalPax}` : "";
  const parts = [
    `#${c.rowIndex}`,
    c.campaignName,
    c.agencyName && `agency:${c.agencyName}`,
    c.pic && `pic:${c.pic}`,
    c.picSupport && `support:${c.picSupport}`,
    c.bdName && `bd:${c.bdName}`,
    c.status && `status:${c.status}`,
    c.stage && `stage:${c.stage}`,
    c.urgent && `urgent:${c.urgent}`,
    c.budget && `budget:${c.budget}`,
    c.dateRequest && `requested:${c.dateRequest}`,
    c.timeline && `timeline:${c.timeline}`,
    c.category && `cat:${c.category}`,
    pax,
    c.zynnApproval && `zynn:${c.zynnApproval}`,
    c.specialRemarks && `remarks:${c.specialRemarks}`,
  ].filter(Boolean);
  return parts.join(" | ");
}

/** Build summary stats so the model can answer aggregate questions without scanning every row. */
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

const SYSTEM_PROMPT = `You are the AI assistant for the YouthsToday KOL Research Dashboard, used by BD team and research interns to track Key Opinion Leader marketing campaigns.

Your two main jobs:
1. **Answer questions** about the team's campaigns using the data block provided below. Be precise, cite campaign names + rowIndex when relevant, and give counts when asked. If the data does not contain what they asked, say so.
2. **Draft copywriting** when asked — outreach DMs to KOLs, captions, follow-up emails, pitch openers. Match the warm friendly tone YouthsToday uses (e.g. "Hi 😊  I'm [Name] from YouthsToday…"). Use line breaks. Keep it natural, not corporate.

Style guide:
- Be concise. Use **bold** for key numbers/names. Use bullet lists when listing multiple campaigns.
- For numbers, give the answer first, then optionally the breakdown.
- When listing campaigns, format as: \`#rowIndex – Campaign Name (PIC, Status)\`
- For copywriting, output ONLY the message body. Do not add intros like "Here's the draft:"; just write it.
- If asked to do something that requires writing to the sheet (assign PIC, change status, etc.), say you can't write yet — recommend they open the campaign in the dashboard and change it manually. (This may be added in a future version.)

Key terms:
- PIC = Person In Charge (research intern). Different from BD (Business Development).
- Status field tracks the high-level pipeline (Request Assign → Done Reach Out → Client Feedback → Approved/Done).
- Stage field tracks profile-list maturity (Sample Profile → Interest Check).
- "Pax" = number of KOLs/seeders required. "filledPax" = how many we've added to the client sheet so far.`;

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

  // Pull live campaign data and compress to a context block
  const campaigns = await fetchCampaigns();
  const summary = buildSummary(campaigns);
  const compactList = campaigns.map(compactCampaign).join("\n");

  const contextBlock = `=== DASHBOARD SNAPSHOT (live) ===\n\n${summary}\n\n=== CAMPAIGN LIST (${campaigns.length} rows) ===\n${compactList}`;

  // Convert our chat history into Gemini's "contents" format
  const contents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const payload = {
    systemInstruction: {
      parts: [{ text: `${SYSTEM_PROMPT}\n\n${contextBlock}` }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      // Gemini 2.5 Flash uses internal "thinking" tokens that count toward
      // maxOutputTokens before it even writes a single character. 2048 was
      // getting eaten by thinking and truncating the visible reply.
      maxOutputTokens: 8192,
    },
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return Response.json(
        { success: false, error: `Gemini error (${res.status}): ${errText.substring(0, 300)}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    // Gemini sometimes returns multiple parts — concatenate all text parts.
    const parts: { text?: string }[] = candidate?.content?.parts ?? [];
    let reply = parts.map((p) => p?.text ?? "").join("") ||
      "(No response generated — try rephrasing your question.)";

    // If the model stopped because of MAX_TOKENS, append a hint so the UI shows it.
    if (candidate?.finishReason === "MAX_TOKENS") {
      reply += "\n\n*(Response was truncated — ask for a shorter list or be more specific.)*";
    } else if (candidate?.finishReason === "SAFETY") {
      reply = "(The model declined to answer this — try rephrasing.)";
    }

    return Response.json({ success: true, reply });
  } catch (e) {
    return Response.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
