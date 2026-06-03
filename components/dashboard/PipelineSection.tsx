"use client";
import Link from "next/link";
import type { Campaign } from "@/lib/types";
import { STATUS_OPTIONS } from "@/lib/constants";
import { paxProgress } from "@/lib/utils";
import { PaxGauge } from "@/components/ui/PaxGauge";

// Tailwind classes for each column header & accent.
const COLUMN_STYLES: Record<string, { header: string; chip: string; accent: string }> = {
  "Request Assign": {
    header: "bg-red-50 text-red-700 border-red-200",
    chip: "bg-red-100 text-red-700",
    accent: "border-t-red-400",
  },
  "Done Reach Out": {
    header: "bg-emerald-50 text-emerald-700 border-emerald-200",
    chip: "bg-emerald-100 text-emerald-700",
    accent: "border-t-emerald-400",
  },
  "Client Feedback to Continue": {
    header: "bg-yellow-50 text-yellow-700 border-yellow-200",
    chip: "bg-yellow-100 text-yellow-700",
    accent: "border-t-yellow-400",
  },
  "Client Approve Project - Handover to Operations": {
    header: "bg-blue-50 text-blue-700 border-blue-200",
    chip: "bg-blue-100 text-blue-700",
    accent: "border-t-blue-400",
  },
  "Done Remark and Complete": {
    header: "bg-teal-50 text-teal-700 border-teal-200",
    chip: "bg-teal-100 text-teal-700",
    accent: "border-t-teal-400",
  },
  "Client Cancel Project": {
    header: "bg-rose-50 text-rose-700 border-rose-200",
    chip: "bg-rose-100 text-rose-700",
    accent: "border-t-rose-400",
  },
};

// Short labels for the column headers (the original status strings are long).
const COLUMN_LABELS: Record<string, string> = {
  "Request Assign": "Request Assign",
  "Done Reach Out": "Done Reach Out",
  "Client Feedback to Continue": "Client Feedback → Continue",
  "Client Approve Project - Handover to Operations": "Client Approved → Handover",
  "Done Remark and Complete": "Done & Complete",
  "Client Cancel Project": "Cancelled",
};

function CampaignCard({ c }: { c: Campaign }) {
  const { percent, required, actual } = paxProgress(c);
  const isAsap = c.urgent?.toLowerCase() === "asap";

  return (
    <Link
      href={`/campaigns/${c.rowIndex}`}
      className="block bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md rounded-lg p-3 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-700">
            {c.campaignName}
          </div>
          {c.agencyName && (
            <div className="text-xs text-gray-500 truncate mt-0.5">{c.agencyName}</div>
          )}
        </div>
        {isAsap && (
          <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded flex-shrink-0">
            ASAP
          </span>
        )}
      </div>

      {/* Stage badge if present */}
      {c.stage && (
        <div className="mb-2">
          <span className="inline-block text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
            {c.stage.length > 38 ? c.stage.slice(0, 35) + "…" : c.stage}
          </span>
        </div>
      )}

      <div className="flex items-end justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
        {/* Left: PIC + filled count */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              {(c.pic || "?").slice(0, 1).toUpperCase()}
            </span>
            <span className="truncate font-medium">{c.pic || "Unassigned"}</span>
          </div>
          {required > 0 && (
            <div className="text-[10px] text-gray-500 mt-1">
              {actual} of {required} pax · {percent}%
            </div>
          )}
        </div>

        {/* Right: gauge (only if a target is set) */}
        {required > 0 ? (
          <PaxGauge actual={actual} required={required} size={48} />
        ) : (
          <div className="text-[10px] text-gray-400 italic px-1">No pax target</div>
        )}
      </div>
    </Link>
  );
}

interface PipelineSectionProps {
  campaigns: Campaign[];
}

export function PipelineSection({ campaigns }: PipelineSectionProps) {
  // Group by status (only campaigns whose status is one of the known options
  // show as columns; unset campaigns get a separate column at the end).
  const grouped: Record<string, Campaign[]> = {};
  for (const s of STATUS_OPTIONS) grouped[s] = [];
  const unset: Campaign[] = [];

  for (const c of campaigns) {
    if (grouped[c.status]) grouped[c.status].push(c);
    else unset.push(c);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Pipeline Board</h3>
          <p className="text-xs text-gray-400 mt-0.5">Drag your eyes across columns — each card is a live campaign</p>
        </div>
        <span className="text-xs text-gray-500">{campaigns.length} total</span>
      </div>

      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex gap-3 min-w-max">
          {STATUS_OPTIONS.map((status) => {
            const list = grouped[status];
            const styles = COLUMN_STYLES[status] ?? COLUMN_STYLES["Request Assign"];
            return (
              <div
                key={status}
                className={`w-[280px] flex-shrink-0 bg-gray-50/50 rounded-xl border-t-4 ${styles.accent} border border-gray-100`}
              >
                <div className={`px-3 py-2.5 border-b border-gray-100 rounded-t-lg ${styles.header}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wide leading-tight">
                      {COLUMN_LABELS[status]}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles.chip}`}>
                      {list.length}
                    </span>
                  </div>
                </div>
                <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
                  {list.length === 0 ? (
                    <div className="text-xs text-gray-400 italic text-center py-4">No campaigns</div>
                  ) : (
                    list.map((c) => <CampaignCard key={c.rowIndex} c={c} />)
                  )}
                </div>
              </div>
            );
          })}

          {/* Unset column — only render if there are any */}
          {unset.length > 0 && (
            <div className="w-[280px] flex-shrink-0 bg-gray-50/50 rounded-xl border-t-4 border-t-gray-300 border border-gray-100">
              <div className="px-3 py-2.5 border-b border-gray-100 rounded-t-lg bg-gray-100 text-gray-600 border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wide">Unset</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                    {unset.length}
                  </span>
                </div>
              </div>
              <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
                {unset.slice(0, 50).map((c) => <CampaignCard key={c.rowIndex} c={c} />)}
                {unset.length > 50 && (
                  <p className="text-xs text-gray-400 italic text-center py-2">+{unset.length - 50} more</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
