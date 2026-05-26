"use client";
import { useState } from "react";
import type { Campaign } from "@/lib/types";
import { updateCampaign } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface CopywritingCardProps {
  campaign: Campaign;
  onToast: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}

export function CopywritingCard({ campaign, onToast, onRefresh }: CopywritingCardProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(campaign.copywriting);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateCampaign(campaign.rowIndex, { copywriting: value });
      setEditing(false);
      onRefresh();
      onToast("Copywriting saved");
    } catch {
      onToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    if (!campaign.copywriting) return;
    navigator.clipboard.writeText(campaign.copywriting);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Outreach Message</h3>
          <p className="text-xs text-gray-400 mt-0.5">Copy this when doing interest checks</p>
        </div>
        <div className="flex gap-2">
          {!editing && campaign.copywriting && (
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? "✓ Copied!" : "Copy"}
            </Button>
          )}
          {!editing ? (
            <Button variant="ghost" size="sm" onClick={() => { setValue(campaign.copywriting); setEditing(true); }}>
              Edit
            </Button>
          ) : (
            <div className="flex gap-1.5">
              <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" loading={saving} onClick={handleSave}>Save</Button>
            </div>
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          placeholder="Hi 😊&#10;&#10;I'm [Name] from YouthsToday. I'd like to check if you might be interested in joining our campaign..."
        />
      ) : campaign.copywriting ? (
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 rounded-lg p-4 border border-gray-100">
          {campaign.copywriting}
        </pre>
      ) : (
        <div className="text-sm text-gray-400 italic bg-gray-50 rounded-lg p-4 border border-dashed border-gray-200">
          No outreach message yet. Click &ldquo;Edit&rdquo; to add one.
        </div>
      )}
    </div>
  );
}
