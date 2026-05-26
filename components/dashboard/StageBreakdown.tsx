import type { Campaign } from "@/lib/types";
import { countByStage } from "@/lib/utils";
import { STAGE_OPTIONS, STAGE_COLORS } from "@/lib/constants";

export function StageBreakdown({ campaigns }: { campaigns: Campaign[] }) {
  const counts = countByStage(campaigns);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">By Stage</h3>
      <div className="space-y-2">
        {STAGE_OPTIONS.map((stage) => (
          <div key={stage} className="flex items-center justify-between">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_COLORS[stage]}`}>{stage}</span>
            <span className="text-sm font-bold text-gray-900">{counts[stage] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
