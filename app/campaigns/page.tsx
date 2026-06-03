"use client";
import { useState } from "react";
import Link from "next/link";
import { useCampaigns } from "@/hooks/useCampaigns";
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { CampaignFiltersBar } from "@/components/campaigns/CampaignFilters";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

type Tab = "active" | "pending";

export default function CampaignsPage() {
  const { assigned, unassigned, filtered, loading, error, filters, setFilters } = useCampaigns();
  const [tab, setTab] = useState<Tab>("active");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-500">
        <Spinner /> Loading campaigns...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">{assigned.length} active · {unassigned.length} pending assignment</p>
        </div>
        <Link href="/campaigns/new">
          <Button>+ New Campaign</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "active" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Active ({assigned.length})
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "pending" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending Assignment
          {unassigned.length > 0 && (
            <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">{unassigned.length}</span>
          )}
        </button>
      </div>

      {tab === "active" && (
        <>
          <CampaignFiltersBar filters={filters} onChange={setFilters} />
          <CampaignTable
            campaigns={filtered}
            emptyTitle="No matching campaigns"
            emptyDescription="Try adjusting your filters or search query."
          />
        </>
      )}

      {tab === "pending" && (
        <CampaignTable
          campaigns={unassigned}
          emptyTitle="All campaigns assigned"
          emptyDescription="No campaigns are waiting for PIC assignment."
        />
      )}
    </>
  );
}
