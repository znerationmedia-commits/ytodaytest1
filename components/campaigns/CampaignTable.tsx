"use client";
import Link from "next/link";
import type { Campaign } from "@/lib/types";
import { StageBadge } from "./StageBadge";
import { UrgencyBadge } from "./UrgencyBadge";
import { formatDate, paxProgress } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { PaxGauge } from "@/components/ui/PaxGauge";

interface CampaignTableProps {
  campaigns: Campaign[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export function CampaignTable({ campaigns, emptyTitle = "No campaigns", emptyDescription, emptyAction }: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Campaign</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">PIC</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Stage</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">Pax</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Urgency</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Budget</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {campaigns.map((c) => (
            <tr key={c.rowIndex} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-400 text-xs">{c.rowIndex}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{c.campaignName || "—"}</div>
                {c.agencyName && <div className="text-xs text-gray-400 mt-0.5">{c.agencyName}</div>}
              </td>
              <td className="px-4 py-3">
                <div className="text-gray-700">{c.pic || <span className="text-gray-400 italic text-xs">Unassigned</span>}</div>
                {c.picSupport && <div className="text-xs text-gray-400">{c.picSupport}</div>}
              </td>
              <td className="px-4 py-3"><StageBadge stage={c.stage} /></td>
              <td className="px-4 py-3">
                {(() => {
                  const { required, actual } = paxProgress(c);
                  if (required === 0) return <span className="text-xs text-gray-400 italic">—</span>;
                  return (
                    <div className="flex items-center gap-2">
                      <PaxGauge actual={actual} required={required} size={40} />
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">{actual}/{required}</span>
                    </div>
                  );
                })()}
              </td>
              <td className="px-4 py-3"><UrgencyBadge urgent={c.urgent} /></td>
              <td className="px-4 py-3 text-gray-600 text-xs max-w-[140px] truncate">{c.revenueSize || "—"}</td>
              <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(c.dateRequest)}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/campaigns/${c.rowIndex}`}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
