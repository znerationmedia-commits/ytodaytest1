"use client";
import type { CampaignFilters } from "@/hooks/useCampaigns";
import { STAGE_OPTIONS, PIC_LIST, BD_LIST } from "@/lib/constants";

interface CampaignFiltersProps {
  filters: CampaignFilters;
  onChange: (f: CampaignFilters) => void;
}

export function CampaignFiltersBar({ filters, onChange }: CampaignFiltersProps) {
  const set = (key: keyof CampaignFilters, value: string | boolean) =>
    onChange({ ...filters, [key]: value });

  const hasActive = filters.search || filters.pic || filters.stage || filters.urgent || filters.bdName;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <input
        type="text"
        placeholder="Search campaigns..."
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
      />
      <select
        value={filters.pic}
        onChange={(e) => set("pic", e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All PICs</option>
        {PIC_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <select
        value={filters.stage}
        onChange={(e) => set("stage", e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All Stages</option>
        {STAGE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select
        value={filters.bdName}
        onChange={(e) => set("bdName", e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All BDs</option>
        {BD_LIST.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.urgent}
          onChange={(e) => set("urgent", e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        ASAP only
      </label>
      {hasActive && (
        <button
          onClick={() => onChange({ search: "", pic: "", stage: "", urgent: false, bdName: "" })}
          className="text-xs text-gray-500 hover:text-gray-800 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
