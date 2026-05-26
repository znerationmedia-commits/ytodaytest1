"use client";
import { useState } from "react";
import type { Campaign } from "@/lib/types";
import { StageBadge } from "@/components/campaigns/StageBadge";
import { UrgencyBadge } from "@/components/campaigns/UrgencyBadge";
import { formatDate } from "@/lib/utils";
import { updateCampaign } from "@/lib/api";
import { PIC_LIST } from "@/lib/constants";

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

interface PicSelectProps {
  label: string;
  value: string;
  rowIndex: number;
  field: "pic" | "picSupport";
  onSaved: (val: string) => void;
  onToast: (msg: string, type?: "success" | "error") => void;
}

function PicSelect({ label, value, rowIndex, field, onSaved, onToast }: PicSelectProps) {
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSaving(true);
    try {
      await updateCampaign(rowIndex, { [field]: val });
      onSaved(val);
      onToast(val ? `${label} assigned to ${val}` : `${label} cleared`);
    } catch {
      onToast(`Failed to update ${label}`, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</dt>
      <dd className="flex items-center gap-2">
        <select
          value={value}
          onChange={handleChange}
          disabled={saving}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 min-w-[140px]"
        >
          <option value="">— Unassigned —</option>
          {PIC_LIST.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {saving && (
          <span className="text-xs text-gray-400 animate-pulse">Saving...</span>
        )}
        {!saving && value && (
          <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            {value}
          </span>
        )}
        {!saving && !value && (
          <span className="text-xs text-amber-600 font-medium">⚠ Needs assignment</span>
        )}
      </dd>
    </div>
  );
}

interface CampaignMetaProps {
  campaign: Campaign;
  onToast: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}

export function CampaignMeta({ campaign, onToast, onRefresh }: CampaignMetaProps) {
  const [pic, setPic] = useState(campaign.pic);
  const [picSupport, setPicSupport] = useState(campaign.picSupport);

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

      <dl className="space-y-3">
        {/* PIC Assignment — inline dropdowns */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-3 border border-gray-100">
          <PicSelect
            label="Assigned PIC"
            value={pic}
            rowIndex={campaign.rowIndex}
            field="pic"
            onSaved={setPic}
            onToast={onToast}
          />
          <PicSelect
            label="PIC Support"
            value={picSupport}
            rowIndex={campaign.rowIndex}
            field="picSupport"
            onSaved={setPicSupport}
            onToast={onToast}
          />
        </div>

        <Row label="BD Name" value={campaign.bdName} />
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
