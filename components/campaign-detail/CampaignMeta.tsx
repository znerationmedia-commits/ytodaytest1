"use client";
import { useState } from "react";
import type { Campaign, KolEntry } from "@/lib/types";
import { StageBadge } from "@/components/campaigns/StageBadge";
import { UrgencyBadge } from "@/components/campaigns/UrgencyBadge";
import { formatDate, paxProgress } from "@/lib/utils";
import { updateCampaign } from "@/lib/api";
import { PaxGauge } from "@/components/ui/PaxGauge";

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

interface EditableTextProps {
  label: string;
  value: string;
  placeholder?: string;
  rowIndex: number;
  field: keyof Campaign;
  onSaved: (val: string) => void;
  onToast: (msg: string, type?: "success" | "error") => void;
  type?: "text" | "number";
  className?: string;
}

/** Inline editable text input — saves on blur or Enter, ignores escape. */
function EditableText({ label, value, placeholder, rowIndex, field, onSaved, onToast, type = "text", className }: EditableTextProps) {
  const [val, setVal] = useState(value);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function commit() {
    if (!dirty) return;
    setSaving(true);
    try {
      await updateCampaign(rowIndex, { [field]: val } as Partial<Campaign>);
      onSaved(val);
      onToast(`${label} saved`);
      setDirty(false);
    } catch {
      onToast(`Failed to save ${label}`, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</dt>
      <dd className="flex items-center gap-2">
        <input
          type={type}
          value={val}
          placeholder={placeholder}
          onChange={(e) => { setVal(e.target.value); setDirty(true); }}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
          disabled={saving}
          className={`text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 ${className ?? "flex-1"}`}
        />
        {saving && <span className="text-xs text-gray-400 animate-pulse">Saving…</span>}
        {!saving && !val && <span className="text-xs text-amber-600 font-medium whitespace-nowrap">⚠ Empty</span>}
      </dd>
    </div>
  );
}

interface CampaignMetaProps {
  campaign: Campaign;
  kolList: KolEntry[];
  onToast: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}

export function CampaignMeta({ campaign, kolList, onToast }: CampaignMetaProps) {
  const [pic, setPic] = useState(campaign.pic);
  const [picSupport, setPicSupport] = useState(campaign.picSupport);
  const [bdName, setBdName] = useState(campaign.bdName);
  const [totalPax, setTotalPax] = useState(campaign.totalPax);

  const actualPax = kolList.length;
  const { percent, required } = paxProgress({ ...campaign, totalPax, filledPax: String(actualPax) }, actualPax);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{campaign.campaignName}</h2>
          {campaign.agencyName && <p className="text-sm text-gray-500">{campaign.agencyName}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          <StageBadge stage={campaign.stage} />
          <UrgencyBadge urgent={campaign.urgent} />
        </div>
      </div>

      {/* Team assignment — free text */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-3 border border-gray-100 mb-4">
        <EditableText
          label="Assigned PIC (Intern)"
          value={pic}
          placeholder="Type intern name…"
          rowIndex={campaign.rowIndex}
          field="pic"
          onSaved={setPic}
          onToast={onToast}
        />
        <EditableText
          label="PIC Support"
          value={picSupport}
          placeholder="Optional support intern"
          rowIndex={campaign.rowIndex}
          field="picSupport"
          onSaved={setPicSupport}
          onToast={onToast}
        />
        <EditableText
          label="BD Name"
          value={bdName}
          placeholder="Type BD name…"
          rowIndex={campaign.rowIndex}
          field="bdName"
          onSaved={setBdName}
          onToast={onToast}
        />
      </div>

      {/* Pax progress */}
      <div className="bg-indigo-50/40 border border-indigo-100 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Profile List Progress</h3>
            <p className="text-xs text-gray-500 mb-3">
              {actualPax} KOL{actualPax !== 1 ? "s" : ""} added of {required || "—"} required
              {percent >= 100 && actualPax > required && (
                <span className="ml-2 text-indigo-600 font-medium">+{actualPax - required} over target</span>
              )}
            </p>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Pax Required</dt>
              <input
                type="number"
                value={totalPax}
                placeholder="e.g. 10"
                onChange={(e) => setTotalPax(e.target.value)}
                onBlur={async () => {
                  if (totalPax === campaign.totalPax) return;
                  try {
                    await updateCampaign(campaign.rowIndex, { totalPax });
                    onToast("Total pax saved");
                  } catch {
                    onToast("Failed to save total pax", "error");
                  }
                }}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                className="w-28 text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
          <PaxGauge actual={actualPax} required={required} />
        </div>
      </div>

      <dl className="space-y-3">
        <Row label="Date Requested" value={formatDate(campaign.dateRequest)} />
        <Row label="Timeline" value={campaign.timeline} />
        <Row label="Budget" value={campaign.budget} />
        <Row label="Revenue Size" value={campaign.revenueSize} />
        <Row label="Category" value={campaign.category} />
        {campaign.clientWebsite && (
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client Reference</dt>
            <dd className="mt-0.5">
              <a href={campaign.clientWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                {campaign.clientWebsite}
              </a>
            </dd>
          </div>
        )}
        <Row label="Platform & Deliverables" value={campaign.platformDetails} />
        <Row label="KOL / Seeder Requirements" value={campaign.kolRequirement} />
      </dl>
    </div>
  );
}
