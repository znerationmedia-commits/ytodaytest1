"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useCampaign } from "@/hooks/useCampaign";
import { useToast } from "@/hooks/useToast";
import { createClientSheet } from "@/lib/api";
import { CampaignMeta } from "@/components/campaign-detail/CampaignMeta";
import { CampaignProgress } from "@/components/campaign-detail/CampaignProgress";
import { CopywritingCard } from "@/components/campaign-detail/CopywritingCard";
import { KolTable } from "@/components/campaign-detail/KolTable";
import { KolQueries } from "@/components/campaign-detail/KolQueries";
import { ToastContainer } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { extractSheetId } from "@/lib/utils";

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const rowIndex = parseInt(id);
  const { campaign, kolList, loading, kolLoading, error, refetch, refetchKols } = useCampaign(rowIndex);
  const { toasts, showToast, dismissToast } = useToast();
  const [creatingSheet, setCreatingSheet] = useState(false);

  async function handleCreateSheet() {
    if (!campaign) return;
    setCreatingSheet(true);
    try {
      const { url } = await createClientSheet(campaign.campaignName, rowIndex);
      showToast("Profile sheet created!");
      refetch();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to create sheet", "error");
    } finally {
      setCreatingSheet(false);
    }
  }

  function handleKolRefresh() {
    if (campaign?.clientSheetLink) refetchKols(campaign.clientSheetLink);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-500">
        <Spinner /> Loading campaign...
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">
        {error ?? "Campaign not found"}
      </div>
    );
  }

  const hasClientSheet = !!campaign.clientSheetLink;

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/campaigns" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{campaign.campaignName}</h1>
        </div>
        <Link href={`/campaigns/${rowIndex}/edit`}>
          <Button variant="secondary" size="sm">Edit Campaign</Button>
        </Link>
      </div>

      {/* Two-column info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <CampaignMeta campaign={campaign} kolList={kolList} onToast={showToast} onRefresh={refetch} />
        <CampaignProgress campaign={campaign} onToast={showToast} onRefresh={refetch} />
      </div>

      {/* Copywriting card */}
      <div className="mb-4">
        <CopywritingCard campaign={campaign} onToast={showToast} onRefresh={refetch} />
      </div>

      {/* KOL Table section */}
      {!hasClientSheet ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No profile sheet yet</h3>
          <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
            Create a formatted Google Sheet to start adding KOL profiles. The link will be saved to the Research sheet automatically.
          </p>
          <Button onClick={handleCreateSheet} loading={creatingSheet}>
            Create Profile Sheet
          </Button>
        </div>
      ) : (
        <>
          {kolLoading ? (
            <div className="flex items-center justify-center h-32 gap-2 text-gray-500 text-sm">
              <Spinner size="sm" /> Loading profiles...
            </div>
          ) : (
            <div className="space-y-4">
              <KolTable
                kols={kolList}
                clientSheetLink={campaign.clientSheetLink}
                onRefresh={handleKolRefresh}
                onToast={showToast}
              />
              <KolQueries kols={kolList} />
            </div>
          )}
        </>
      )}
    </>
  );
}
