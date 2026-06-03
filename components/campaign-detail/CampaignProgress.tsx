"use client";
import { useState } from "react";
import type { Campaign } from "@/lib/types";
import { updateCampaign } from "@/lib/api";
import { STAGE_OPTIONS, STATUS_OPTIONS, STATUS_COLORS } from "@/lib/constants";

function CheckItem({ label, value }: { label: string; value: string }) {
  const isYes = value?.toLowerCase() === "yes";
  const isEmpty = !value;
  return (
    <div className="flex items-center gap-2">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
        isYes ? "bg-green-100 text-green-700" : isEmpty ? "bg-gray-100 text-gray-400" : "bg-red-100 text-red-600"
      }`}>
        {isYes ? "✓" : isEmpty ? "–" : "✕"}
      </span>
      <span className="text-sm text-gray-700">{label}</span>
      {!isEmpty && !isYes && <span className="text-xs text-gray-400">{value}</span>}
    </div>
  );
}

function LinkItem({ label, url }: { label: string; url: string }) {
  if (!url) return null;
  return (
    <div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <div className="mt-0.5">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">{url}</a>
      </div>
    </div>
  );
}

interface CampaignProgressProps {
  campaign: Campaign;
  onToast: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}

export function CampaignProgress({ campaign, onToast, onRefresh }: CampaignProgressProps) {
  const [status, setStatus] = useState(campaign.status);
  const [stage, setStage] = useState(campaign.stage);
  const [specialRemarks, setSpecialRemarks] = useState(campaign.specialRemarks);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingStage, setSavingStage] = useState(false);
  const [savingRemarks, setSavingRemarks] = useState(false);

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSavingStatus(true);
    try {
      await updateCampaign(campaign.rowIndex, { status: val });
      setStatus(val as Campaign["status"]);
      onToast(`Status updated → ${val || "—"}`);
      onRefresh();
    } catch {
      onToast("Failed to update status", "error");
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleStageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSavingStage(true);
    try {
      await updateCampaign(campaign.rowIndex, { stage: val });
      setStage(val as Campaign["stage"]);
      onToast(`Stage updated → ${val || "—"}`);
    } catch {
      onToast("Failed to update stage", "error");
    } finally {
      setSavingStage(false);
    }
  }

  async function saveRemarks() {
    if (specialRemarks === campaign.specialRemarks) return;
    setSavingRemarks(true);
    try {
      await updateCampaign(campaign.rowIndex, { specialRemarks });
      onToast("Special remarks saved");
    } catch {
      onToast("Failed to save remarks", "error");
    } finally {
      setSavingRemarks(false);
    }
  }

  const statusClasses = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Pipeline & Progress</h3>

      {/* Status dropdown — highlighted */}
      <div className={`rounded-lg p-3 mb-3 border ${statusClasses}`}>
        <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5">
          Status (Pipeline Stage)
        </label>
        <select
          value={status}
          onChange={handleStatusChange}
          disabled={savingStatus}
          className="w-full text-sm font-medium bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
        >
          <option value="">— Not set —</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {savingStatus && <p className="text-xs mt-1 opacity-70 animate-pulse">Saving…</p>}
      </div>

      {/* Stage dropdown */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 block mb-1.5">
          Profile Stage
        </label>
        <select
          value={stage}
          onChange={handleStageChange}
          disabled={savingStage}
          className="w-full text-sm bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
        >
          <option value="">— Not set —</option>
          {STAGE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          {/* Show current value even if not in canonical list (legacy data) */}
          {stage && !STAGE_OPTIONS.includes(stage as typeof STAGE_OPTIONS[number]) && (
            <option value={stage}>{stage} (legacy)</option>
          )}
        </select>
        {savingStage && <p className="text-xs mt-1 text-gray-400 animate-pulse">Saving…</p>}
      </div>

      {/* Special Remarks */}
      <div className="mb-5">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 block mb-1.5">
          Special Remarks (BD ↔ Research)
        </label>
        <textarea
          value={specialRemarks}
          onChange={(e) => setSpecialRemarks(e.target.value)}
          onBlur={saveRemarks}
          rows={3}
          placeholder="Notes between BD team and research team (e.g. urgency context, client requests)"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {savingRemarks && <p className="text-xs mt-1 text-gray-400 animate-pulse">Saving…</p>}
        <p className="text-xs text-gray-400 mt-1">Saved to column AD on blur</p>
      </div>

      <div className="space-y-2 mb-5 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
            campaign.zynnApproval ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-600"
          }`}>
            {campaign.zynnApproval ? "✓" : "⏳"}
          </span>
          <span className="text-sm text-gray-700">Zynn Approval</span>
          {campaign.zynnApproval && <span className="text-xs text-gray-500">({campaign.zynnApproval})</span>}
        </div>
        <CheckItem label="Telegram Posted" value={campaign.telegramPosted} />
        <CheckItem label="Email Blasted" value={campaign.emailBlasted} />
        <CheckItem label="FB Group Posted" value={campaign.fbGroupPosted} />
      </div>

      <div className="space-y-3 border-t border-gray-100 pt-4">
        <LinkItem label="YT Unique Link" url={campaign.ytUniqueLink} />
        <LinkItem label="YT Admin Link" url={campaign.ytAdminLink} />
        <LinkItem label="Internal Sheet" url={campaign.internalSheet} />
      </div>
    </div>
  );
}
