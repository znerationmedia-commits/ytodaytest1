import type { Campaign, StageValue } from "./types";
import { STAGE_OPTIONS, STATUS_RETENTION_DAYS, COMPLETED_STATUSES } from "./constants";

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

function daysSince(dateStr: string): number {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return Infinity;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Decides whether a campaign should still appear in the live pipeline
 * based on its status and how long ago its statusUpdatedAt was.
 */
export function isInPipeline(c: Campaign): boolean {
  const retention = STATUS_RETENTION_DAYS[c.status];
  if (retention === undefined) return true; // always in pipeline
  return daysSince(c.statusUpdatedAt) <= retention;
}

/**
 * Campaigns marked complete/handover whose retention has expired.
 * These go into the "Completed Projects" section.
 */
export function isCompleted(c: Campaign): boolean {
  if (!COMPLETED_STATUSES.has(c.status)) return false;
  const retention = STATUS_RETENTION_DAYS[c.status] ?? 0;
  return daysSince(c.statusUpdatedAt) > retention;
}

/**
 * Pax progress derived from the campaign row.
 * - actual: prefer the live kolList count if provided, else the stored filledPax.
 * - required: from totalPax column on the research sheet.
 */
export function paxProgress(c: Campaign, actualOverride?: number): { percent: number; required: number; actual: number } {
  const required = parseInt(c.totalPax) || 0;
  const actual = actualOverride !== undefined ? actualOverride : (parseInt(c.filledPax) || 0);
  if (required === 0) return { percent: 0, required: 0, actual };
  return { percent: Math.round((actual / required) * 100), required, actual };
}

export function filterCampaigns(
  campaigns: Campaign[],
  filters: { search: string; pic: string; stage: string; urgent: boolean; bdName: string }
): Campaign[] {
  return campaigns.filter((c) => {
    if (filters.pic && !c.pic?.toLowerCase().includes(filters.pic.toLowerCase())) return false;
    if (filters.stage && c.stage !== filters.stage) return false;
    if (filters.urgent && c.urgent?.toLowerCase() !== "asap") return false;
    if (filters.bdName && !c.bdName?.toLowerCase().includes(filters.bdName.toLowerCase())) return false;
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
