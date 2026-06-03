import type { KolEntry } from "@/lib/types";

export function KolQueries({ kols }: { kols: KolEntry[] }) {
  const withQueries = kols.filter((k) => k.clientRemarks && k.clientRemarks.trim() !== "");

  if (kols.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">KOL Questions & Queries</h3>
          <p className="text-xs text-gray-400 mt-0.5">From client sheet column H (Client Remarks)</p>
        </div>
        <span className="text-xs text-gray-400">
          {withQueries.length} of {kols.length} KOLs have queries
        </span>
      </div>

      {withQueries.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No queries from KOLs yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {withQueries.map((k) => (
            <li key={k.rowIndex} className="bg-amber-50/40 border border-amber-100 rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{k.name || "Unnamed KOL"}</div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{k.clientRemarks}</p>
                </div>
                {k.profileLink && (
                  <a
                    href={k.profileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline whitespace-nowrap flex-shrink-0"
                  >
                    Profile ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
