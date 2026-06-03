"use client";
import Link from "next/link";
import type { Campaign } from "@/lib/types";

export function CompletedProjects({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Completed Projects</h3>
        <p className="text-sm text-gray-400">No completed projects yet. Projects move here 15 days after being marked &quot;Done Remark and Complete&quot; or &quot;Client Approve Project - Handover to Operations&quot;.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Completed Projects</h3>
        <span className="text-xs text-gray-400">{campaigns.length} completed</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {campaigns.map((c) => (
          <Link
            key={c.rowIndex}
            href={`/campaigns/${c.rowIndex}`}
            className="flex items-center justify-between px-3 py-2 bg-emerald-50/50 hover:bg-emerald-100/60 border border-emerald-100 rounded-lg transition-colors text-sm"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{c.campaignName}</div>
              <div className="text-xs text-gray-500 truncate">
                {c.pic || "—"} · {c.status}
              </div>
            </div>
            <span className="text-emerald-600 text-xs">✓</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
