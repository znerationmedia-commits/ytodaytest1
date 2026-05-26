import { CampaignForm } from "@/components/forms/CampaignForm";

export default function NewCampaignPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Campaign</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in the campaign details to add it to the research tracker.</p>
      </div>
      <CampaignForm mode="create" />
    </>
  );
}
