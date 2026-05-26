import Link from "next/link";
import type { Campaign } from "@/lib/types";
import { StageBadge } from "@/components/campaigns/StageBadge";
import { UrgencyBadge } from "@/components/campaigns/UrgencyBadge";
import { formatDate, sortByDateDesc } from "@/lib/utils";

export function RecentCampaigns({ campaigns }: { campaigns: Campaign[] }) {
  const recent = sortByDateDesc(campaigns).slice(0, 5);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Recent Campaigns</h3>
        <Link href="/campaigns" className="text-xs text-indigo-600 hover:underline">View all →</Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-gray-400">No campaigns yet.</p>
      ) : (
        <div className="space-y-2">
          {recent.map((c) => (
            <Link
              key={c.rowIndex}
              href={`/campaigns/${c.rowIndex}`}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{c.campaignName}</p>
                <p className="text-xs text-gray-400">{c.pic || "Unassigned"} · {formatDate(c.dateRequest)}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <StageBadge stage={c.stage} />
                <UrgencyBadge urgent={c.urgent} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
