"use client";
import Link from "next/link";
import type { Campaign } from "@/lib/types";
import { STATUS_OPTIONS, STATUS_COLORS } from "@/lib/constants";

interface PipelineSectionProps {
  campaigns: Campaign[];
}

export function PipelineSection({ campaigns }: PipelineSectionProps) {
  // Group by status
  const grouped: Record<string, Campaign[]> = {};
  for (const s of STATUS_OPTIONS) grouped[s] = [];
  grouped["__unset"] = [];
  for (const c of campaigns) {
    if (grouped[c.status]) grouped[c.status].push(c);
    else grouped["__unset"].push(c);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Pipeline by Status</h3>
        <span className="text-xs text-gray-400">{campaigns.length} active</span>
      </div>

      <div className="space-y-4">
        {STATUS_OPTIONS.map((status) => {
          const list = grouped[status];
          if (!list || list.length === 0) return null;
          const colorClass = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
          return (
            <div key={status}>
              <div className={`inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full border mb-2 ${colorClass}`}>
                {status}
                <span className="bg-white/80 text-gray-700 rounded-full px-1.5 py-0.5 text-[10px]">{list.length}</span>
              </div>
              <div className="space-y-1.5">
                {list.slice(0, 8).map((c) => (
                  <Link
                    key={c.rowIndex}
                    href={`/campaigns/${c.rowIndex}`}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors text-sm group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{c.campaignName}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {c.pic || "Unassigned"}{c.agencyName ? ` · ${c.agencyName}` : ""}
                      </div>
                    </div>
                    {c.urgent?.toLowerCase() === "asap" && (
                      <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">ASAP</span>
                    )}
                  </Link>
                ))}
                {list.length > 8 && (
                  <p className="text-xs text-gray-400 text-center py-1">+{list.length - 8} more</p>
                )}
              </div>
            </div>
          );
        })}
        {grouped["__unset"].length > 0 && (
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full border mb-2 bg-gray-100 text-gray-700 border-gray-200">
              Unset
              <span className="bg-white/80 rounded-full px-1.5 py-0.5 text-[10px]">{grouped["__unset"].length}</span>
            </div>
            <p className="text-xs text-gray-400 italic">{grouped["__unset"].length} campaigns have no status set yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
