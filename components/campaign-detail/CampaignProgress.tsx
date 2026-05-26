import type { Campaign } from "@/lib/types";

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

export function CampaignProgress({ campaign }: { campaign: Campaign }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Research Progress</h3>

      <div className="space-y-2 mb-5">
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
        {campaign.ytAdminContact && (
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">YT Admin Contact</span>
            <p className="mt-0.5 text-sm text-gray-700">{campaign.ytAdminContact}</p>
          </div>
        )}
        {campaign.heepsyContact && (
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Heepsy Contact</span>
            <p className="mt-0.5 text-sm text-gray-700">{campaign.heepsyContact}</p>
          </div>
        )}
        {campaign.googleResearch && (
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Google Research Notes</span>
            <p className="mt-0.5 text-sm text-gray-700 whitespace-pre-wrap">{campaign.googleResearch}</p>
          </div>
        )}
      </div>
    </div>
  );
}
