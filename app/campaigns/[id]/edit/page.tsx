"use client";
import { use } from "react";
import { useCampaign } from "@/hooks/useCampaign";
import { CampaignForm } from "@/components/forms/CampaignForm";
import { Spinner } from "@/components/ui/Spinner";
import Link from "next/link";

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const rowIndex = parseInt(id);
  const { campaign, loading, error } = useCampaign(rowIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-500">
        <Spinner /> Loading...
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

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/campaigns/${rowIndex}`} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
          <p className="text-sm text-gray-500 mt-0.5">{campaign.campaignName}</p>
        </div>
      </div>
      <CampaignForm mode="edit" initial={campaign} />
    </>
  );
}
