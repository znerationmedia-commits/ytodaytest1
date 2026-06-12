"use client";
import type { Campaign } from "@/lib/types";

// Statuses that count toward "active workload" — actions the PIC still owes
// (either kicking off, or chasing client decisions). Excludes Done Reach Out,
// Handover, Complete, and Cancel — those are no longer requiring action.
const ACTIVE_STATUSES = [
  "Request Assign",
  "Client Feedback to Continue",
] as const;

// Synthetic bucket for "assisting" — when this person is in the picSupport
// field of someone else's campaign. Distinct from the status-based buckets.
const ASSISTING = "Assisting";

type Bucket = typeof ACTIVE_STATUSES[number] | typeof ASSISTING;

const BUCKET_STYLES: Record<Bucket, { dot: string; chip: string; barFill: string; label: string }> = {
  "Request Assign": {
    dot: "bg-red-500",
    chip: "bg-red-50 text-red-700 border-red-200",
    barFill: "bg-red-400",
    label: "Request Assign",
  },
  "Client Feedback to Continue": {
    dot: "bg-yellow-500",
    chip: "bg-yellow-50 text-yellow-700 border-yellow-200",
    barFill: "bg-yellow-400",
    label: "Client Feedback",
  },
  [ASSISTING]: {
    dot: "bg-violet-500",
    chip: "bg-violet-50 text-violet-700 border-violet-200",
    barFill: "bg-violet-400",
    label: "Assisting",
  },
};

const BUCKET_ORDER: Bucket[] = ["Request Assign", "Client Feedback to Continue", ASSISTING];

interface PICWorkloadProps {
  /**
   * All assigned campaigns in ACTIVE_STATUSES — used for the main PIC count.
   * picSupport (assisting role) is derived from the same set internally.
   */
  campaigns: Campaign[];
}

export function PICWorkload({ campaigns }: PICWorkloadProps) {
  type PicRow = { pic: string; total: number } & Record<Bucket, number>;
  const map = new Map<string, PicRow>();

  function ensureRow(name: string): PicRow {
    if (!map.has(name)) {
      map.set(name, {
        pic: name,
        total: 0,
        "Request Assign": 0,
        "Client Feedback to Continue": 0,
        [ASSISTING]: 0,
      });
    }
    return map.get(name)!;
  }

  for (const c of campaigns) {
    const mainPic = (c.pic || "").trim();
    const supportPic = (c.picSupport || "").trim();

    // Main PIC role — only counts when the campaign status is one of the active buckets
    if (mainPic && ACTIVE_STATUSES.includes(c.status as typeof ACTIVE_STATUSES[number])) {
      const row = ensureRow(mainPic);
      row[c.status as typeof ACTIVE_STATUSES[number]] += 1;
      row.total += 1;
    }

    // Assisting role — anyone in picSupport gets a separate +1 (don't double-count
    // if they're somehow listed as both)
    if (supportPic && supportPic !== mainPic) {
      const row = ensureRow(supportPic);
      row[ASSISTING] += 1;
      row.total += 1;
    }
  }

  const rows = Array.from(map.values()).sort((a, b) => b.total - a.total);
  const maxTotal = Math.max(...rows.map((r) => r.total), 1);

  const teamTotal = rows.reduce((s, r) => s + r.total, 0);
  const teamByBucket: Record<Bucket, number> = {
    "Request Assign": rows.reduce((s, r) => s + r["Request Assign"], 0),
    "Client Feedback to Continue": rows.reduce((s, r) => s + r["Client Feedback to Continue"], 0),
    [ASSISTING]: rows.reduce((s, r) => s + r[ASSISTING], 0),
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">PIC Workload</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Active campaigns per intern · main PIC + assisting (picSupport)
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-gray-900 leading-none">{teamTotal}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Total assignments</div>
        </div>
      </div>

      {/* Team-wide bucket chips */}
      <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-gray-100">
        {BUCKET_ORDER.map((b) => {
          const styles = BUCKET_STYLES[b];
          return (
            <div key={b} className={`inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full border ${styles.chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
              <span>{styles.label}</span>
              <span className="font-bold">{teamByBucket[b]}</span>
            </div>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 italic py-4 text-center">
          No active campaigns right now.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.pic}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    {r.pic.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{r.pic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{r.total}</span>
                  <span className="text-[10px] text-gray-400 uppercase">active</span>
                </div>
              </div>

              {/* Stacked bar */}
              <div className="flex h-2 rounded-full bg-gray-100 overflow-hidden mb-1.5">
                {BUCKET_ORDER.map((b) => {
                  const pct = (r[b] / maxTotal) * 100;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={b}
                      className={`${BUCKET_STYLES[b].barFill} transition-all`}
                      style={{ width: `${pct}%` }}
                      title={`${BUCKET_STYLES[b].label}: ${r[b]}`}
                    />
                  );
                })}
              </div>

              {/* Per-bucket chips */}
              <div className="flex flex-wrap gap-1.5">
                {BUCKET_ORDER.map((b) => {
                  if (r[b] === 0) return null;
                  return (
                    <span
                      key={b}
                      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${BUCKET_STYLES[b].chip}`}
                    >
                      <span className={`w-1 h-1 rounded-full ${BUCKET_STYLES[b].dot}`}></span>
                      {BUCKET_STYLES[b].label} {r[b]}
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
