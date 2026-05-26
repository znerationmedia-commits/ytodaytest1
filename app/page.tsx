"use client";
import Link from "next/link";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useToast } from "@/hooks/useToast";
import { updateCampaign } from "@/lib/api";
import { StatCard } from "@/components/dashboard/StatCard";
import { StageBreakdown } from "@/components/dashboard/StageBreakdown";
import { PICWorkload } from "@/components/dashboard/PICWorkload";
import { RecentCampaigns } from "@/components/dashboard/RecentCampaigns";
import { ToastContainer } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { PIC_LIST } from "@/lib/constants";
import type { Campaign } from "@/lib/types";

export default function HomePage() {
  const { all, assigned, unassigned, loading, error, refetch } = useCampaigns();
  const { toasts, showToast, dismissToast } = useToast();

  const urgent = assigned.filter((c) => c.urgent?.toLowerCase() === "asap");
  const pendingApproval = assigned.filter((c) => !c.zynnApproval);

  async function handleAssign(c: Campaign, pic: string) {
    try {
      await updateCampaign(c.rowIndex, { pic });
      refetch();
      showToast(`Assigned to ${pic}`);
    } catch {
      showToast("Failed to assign", "error");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-500">
        <Spinner /> Loading dashboard...
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
          <p className="text-sm text-gray-500 mt-0.5">{assigned.length} active campaign{assigned.length !== 1 ? "s" : ""}</p>
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
              <div key={c.rowIndex} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-amber-100">
                <div>
                  <span className="text-sm font-medium text-gray-900">{c.campaignName}</span>
                  {c.agencyName && <span className="text-xs text-gray-400 ml-2">· {c.agencyName}</span>}
                  {c.bdName && <span className="text-xs text-gray-400 ml-1">· BD: {c.bdName}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue=""
                    onChange={(e) => { if (e.target.value) handleAssign(c, e.target.value); }}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Assign intern…</option>
                    {PIC_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <Link href={`/campaigns/${c.rowIndex}`} className="text-xs text-indigo-600 hover:underline">View</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Urgent banner */}
      {urgent.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <span className="text-red-600 font-semibold text-sm">⚡ {urgent.length} ASAP: </span>
          <span className="text-red-500 text-sm">{urgent.map((c) => c.campaignName).join(", ")}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Campaigns" value={all.length} color="indigo" />
        <StatCard label="Needs Assignment" value={unassigned.length} color={unassigned.length > 0 ? "amber" : "gray"} sub="awaiting PIC" />
        <StatCard label="ASAP / Urgent" value={urgent.length} color={urgent.length > 0 ? "red" : "gray"} />
        <StatCard label="Pending QC" value={pendingApproval.length} color="amber" sub="no Zynn approval yet" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentCampaigns campaigns={assigned} />
        </div>
        <div className="space-y-4">
          <StageBreakdown campaigns={assigned} />
          <PICWorkload campaigns={assigned} />
        </div>
      </div>
    </>
  );
}
