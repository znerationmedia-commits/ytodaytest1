import type { Campaign } from "@/lib/types";
import { countByPic } from "@/lib/utils";

const PIC_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-sky-500",
];

export function PICWorkload({ campaigns }: { campaigns: Campaign[] }) {
  const counts = countByPic(campaigns);
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map((e) => e[1]), 1);

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Team Workload</h3>
        <p className="text-sm text-gray-400">No assigned campaigns yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Team Workload</h3>
      <div className="space-y-3">
        {entries.map(([pic, count], i) => (
          <div key={pic}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{pic}</span>
              <span className="text-sm font-bold text-gray-900">{count}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${PIC_COLORS[i % PIC_COLORS.length]}`}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
