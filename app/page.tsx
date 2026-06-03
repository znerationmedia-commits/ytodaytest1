"use client";
import { useState } from "react";
import Link from "next/link";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useToast } from "@/hooks/useToast";
import { updateCampaign } from "@/lib/api";
import { StatCard } from "@/components/dashboard/StatCard";
import { PipelineSection } from "@/components/dashboard/PipelineSection";
import { CompletedProjects } from "@/components/dashboard/CompletedProjects";
import { PICWorkload } from "@/components/dashboard/PICWorkload";
import { ToastContainer } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { isInPipeline, isCompleted } from "@/lib/utils";

const WORKLOAD_ACTIVE_STATUSES = new Set([
  "Request Assign",
  "Client Feedback to Continue",
]);
import type { Campaign } from "@/lib/types";

export default function HomePage() {
  const { all, assigned, unassigned, loading, error, refetch } = useCampaigns();
  const { toasts, showToast, dismissToast } = useToast();
  const [assigningRow, setAssigningRow] = useState<number | null>(null);

  // Pipeline = assigned campaigns that are still inside retention windows
  const pipeline = assigned.filter(isInPipeline);
  const completed = assigned.filter(isCompleted);
  const urgent = pipeline.filter((c) => c.urgent?.toLowerCase() === "asap");

  // Workload = active statuses (Request Assign / Done Reach Out / Client Feedback).
  // No date cutoff — a campaign stays on the PIC's plate until they actively move
  // its status forward to Handover / Complete / Cancel.
  const workloadCampaigns = assigned.filter((c) => WORKLOAD_ACTIVE_STATUSES.has(c.status));

  async function handleAssign(c: Campaign, picName: string) {
    if (!picName.trim()) return;
    setAssigningRow(c.rowIndex);
    try {
      await updateCampaign(c.rowIndex, { pic: picName.trim() });
      refetch();
      showToast(`Assigned to ${picName}`);
    } catch {
      showToast("Failed to assign", "error");
    } finally {
      setAssigningRow(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-500">
        <Spinner /> Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p className="font-semibold">Could not load data</p>
        <p className="text-sm mt-1">{error}</p>
        <p className="text-xs mt-2 text-red-500">Make sure NEXT_PUBLIC_GAS_WEB_APP_URL is set correctly in your .env.local file.</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pipeline.length} active in pipeline · {completed.length} completed
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Campaign
        </Link>
      </div>

      {/* Needs Assignment */}
      {unassigned.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-amber-700 font-semibold text-sm mb-3">
            ⚠️ {unassigned.length} campaign{unassigned.length !== 1 ? "s" : ""} need{unassigned.length === 1 ? "s" : ""} assignment
          </p>
          <div className="space-y-2">
            {unassigned.map((c) => (
              <UnassignedRow key={c.rowIndex} c={c} saving={assigningRow === c.rowIndex} onAssign={handleAssign} />
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="In Pipeline" value={pipeline.length} color="indigo" />
        <StatCard label="Needs Assignment" value={unassigned.length} color={unassigned.length > 0 ? "amber" : "gray"} sub="awaiting PIC" />
        <StatCard label="ASAP / Urgent" value={urgent.length} color={urgent.length > 0 ? "red" : "gray"} />
        <StatCard label="Completed" value={completed.length} color="gray" sub="past retention" />
      </div>

      {/* Pipeline by status */}
      <div className="mb-6">
        <PipelineSection campaigns={pipeline} />
      </div>

      {/* PIC Workload */}
      <div className="mb-6">
        <PICWorkload campaigns={workloadCampaigns} />
      </div>

      {/* Completed projects */}
      <div className="mb-6">
        <CompletedProjects campaigns={completed} />
      </div>
    </>
  );
}

function UnassignedRow({ c, saving, onAssign }: { c: Campaign; saving: boolean; onAssign: (c: Campaign, name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-amber-100">
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900">{c.campaignName}</span>
        {c.agencyName && <span className="text-xs text-gray-400 ml-2">· {c.agencyName}</span>}
        {c.bdName && <span className="text-xs text-gray-400 ml-1">· BD: {c.bdName}</span>}
      </div>
      <div className="flex items-center gap-2 ml-3">
        <input
          type="text"
          value={name}
          placeholder="Type intern…"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onAssign(c, name); }}
          className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32"
        />
        <button
          onClick={() => name.trim() && onAssign(c, name)}
          disabled={saving || !name.trim()}
          className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "…" : "Assign"}
        </button>
        <Link href={`/campaigns/${c.rowIndex}`} className="text-xs text-indigo-600 hover:underline">View</Link>
      </div>
    </div>
  );
}
