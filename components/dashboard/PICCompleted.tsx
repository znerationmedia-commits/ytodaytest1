"use client";
import type { Campaign } from "@/lib/types";

// Statuses that count as a "done" outcome from the research team's side.
const COMPLETED_STATUSES = [
  "Client Approve Project - Handover to Operations",
  "Done Remark and Complete",
] as const;

type CompletedStatus = typeof COMPLETED_STATUSES[number];

const STATUS_STYLES: Record<CompletedStatus, { dot: string; chip: string; barFill: string; label: string }> = {
  "Client Approve Project - Handover to Operations": {
    dot: "bg-blue-500",
    chip: "bg-blue-50 text-blue-700 border-blue-200",
    barFill: "bg-blue-400",
    label: "Handover",
  },
  "Done Remark and Complete": {
    dot: "bg-teal-500",
    chip: "bg-teal-50 text-teal-700 border-teal-200",
    barFill: "bg-teal-400",
    label: "Done & Complete",
  },
};

interface PICCompletedProps {
  /** All assigned campaigns — this component filters down internally. */
  campaigns: Campaign[];
}

export function PICCompleted({ campaigns }: PICCompletedProps) {
  type PicRow = { pic: string; total: number } & Record<CompletedStatus, number>;
  const map = new Map<string, PicRow>();

  for (const c of campaigns) {
    if (!COMPLETED_STATUSES.includes(c.status as CompletedStatus)) continue;
    const pic = (c.pic || "Unassigned").trim() || "Unassigned";
    const status = c.status as CompletedStatus;

    if (!map.has(pic)) {
      map.set(pic, {
        pic,
        total: 0,
        "Client Approve Project - Handover to Operations": 0,
        "Done Remark and Complete": 0,
      });
    }
    const row = map.get(pic)!;
    row.total += 1;
    row[status] += 1;
  }

  const rows = Array.from(map.values()).sort((a, b) => b.total - a.total);
  const maxTotal = Math.max(...rows.map((r) => r.total), 1);
  const teamTotal = rows.reduce((s, r) => s + r.total, 0);
  const teamByStatus = {
    "Client Approve Project - Handover to Operations": rows.reduce(
      (s, r) => s + r["Client Approve Project - Handover to Operations"],
      0
    ),
    "Done Remark and Complete": rows.reduce((s, r) => s + r["Done Remark and Complete"], 0),
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Completed Campaigns by PIC</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            All-time tally of campaigns each intern carried to handover or completion
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-gray-900 leading-none">{teamTotal}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Total done</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-gray-100">
        {COMPLETED_STATUSES.map((s) => {
          const styles = STATUS_STYLES[s];
          return (
            <div key={s} className={`inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full border ${styles.chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
              <span>{styles.label}</span>
              <span className="font-bold">{teamByStatus[s]}</span>
            </div>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 italic py-4 text-center">
          No campaigns marked Handover or Done & Complete yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.pic}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                    {r.pic.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{r.pic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{r.total}</span>
                  <span className="text-[10px] text-gray-400 uppercase">done</span>
                </div>
              </div>

              <div className="flex h-2 rounded-full bg-gray-100 overflow-hidden mb-1.5">
                {COMPLETED_STATUSES.map((s) => {
                  const pct = (r[s] / maxTotal) * 100;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={s}
                      className={`${STATUS_STYLES[s].barFill} transition-all`}
                      style={{ width: `${pct}%` }}
                      title={`${STATUS_STYLES[s].label}: ${r[s]}`}
                    />
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {COMPLETED_STATUSES.map((s) => {
                  if (r[s] === 0) return null;
                  return (
                    <span
                      key={s}
                      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${STATUS_STYLES[s].chip}`}
                    >
                      <span className={`w-1 h-1 rounded-full ${STATUS_STYLES[s].dot}`}></span>
                      {STATUS_STYLES[s].label} {r[s]}
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
