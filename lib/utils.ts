import type { Campaign, StageValue } from "./types";
import { STAGE_OPTIONS } from "./constants";

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

export function extractSheetId(url: string): string {
  if (!url) return "";
  // Standard: /spreadsheets/d/ID/ or /file/d/ID/
  const matchD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD) return matchD[1];
  // Drive open link: ?id=ID or &id=ID
  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId) return matchId[1];
  // If it looks like a bare ID (no URL wrapper)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(url.trim())) return url.trim();
  return "";
}

export function isUnassigned(c: Campaign): boolean {
  return !c.pic || c.pic.trim() === "";
}

export function isAssigned(c: Campaign): boolean {
  return !isUnassigned(c);
}

export function countByStage(campaigns: Campaign[]): Record<StageValue | string, number> {
  const counts: Record<string, number> = {};
  for (const s of STAGE_OPTIONS) counts[s] = 0;
  for (const c of campaigns) {
    if (c.stage && counts[c.stage] !== undefined) counts[c.stage]++;
  }
  return counts;
}

export function countByPic(campaigns: Campaign[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of campaigns.filter((x) => x.pic)) {
    counts[c.pic] = (counts[c.pic] ?? 0) + 1;
  }
  return counts;
}

export function sortByDateDesc(campaigns: Campaign[]): Campaign[] {
  return [...campaigns].sort((a, b) => {
    if (!a.dateRequest) return 1;
    if (!b.dateRequest) return -1;
    return new Date(b.dateRequest).getTime() - new Date(a.dateRequest).getTime();
  });
}

export function filterCampaigns(
  campaigns: Campaign[],
  filters: { search: string; pic: string; stage: string; urgent: boolean; bdName: string }
): Campaign[] {
  return campaigns.filter((c) => {
    if (filters.pic && c.pic !== filters.pic) return false;
    if (filters.stage && c.stage !== filters.stage) return false;
    if (filters.urgent && c.urgent?.toLowerCase() !== "asap") return false;
    if (filters.bdName && c.bdName !== filters.bdName) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !c.campaignName?.toLowerCase().includes(q) &&
        !c.agencyName?.toLowerCase().includes(q) &&
        !c.clientWebsite?.toLowerCase().includes(q) &&
        !c.bdName?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}
