"use client";
import { useState } from "react";
import type { KolEntry } from "@/lib/types";
import { updateKolEntry, addKolEntry } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { KolForm } from "@/components/forms/KolForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { extractSheetId } from "@/lib/utils";

interface KolTableProps {
  kols: KolEntry[];
  clientSheetLink: string;
  campaignRowIndex: number;
  onRefresh: () => void;
  onToast: (msg: string, type?: "success" | "error") => void;
}

const interestOptions = ["", "YES", "NO"];

function InterestSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`text-xs rounded px-1.5 py-1 border focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
        value === "YES" ? "bg-green-50 border-green-300 text-green-800" :
        value === "NO" ? "bg-red-50 border-red-300 text-red-700" :
        "bg-gray-50 border-gray-200 text-gray-500"
      }`}
    >
      {interestOptions.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
    </select>
  );
}

export function KolTable({ kols, clientSheetLink, campaignRowIndex, onRefresh, onToast }: KolTableProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const sheetId = extractSheetId(clientSheetLink);

  async function handleInterestChange(kol: KolEntry, field: "interestCheckClient" | "interestCheckKol", val: string) {
    setSaving(kol.rowIndex);
    try {
      await updateKolEntry(sheetId, kol.rowIndex, { [field]: val });
      onRefresh();
      onToast("Updated");
    } catch {
      onToast("Failed to update", "error");
    } finally {
      setSaving(null);
    }
  }

  async function handleAdd(data: Omit<KolEntry, "rowIndex" | "no">) {
    if (!sheetId) {
      throw new Error(
        `Could not read the Google Sheet ID from the stored link. ` +
        `Please open the campaign, check that the Client Sheet link in column Q is a valid Google Sheets URL, then try again.\n\nStored value: "${clientSheetLink}"`
      );
    }
    await addKolEntry(sheetId, data, campaignRowIndex);
    setShowAdd(false);
    onRefresh();
    onToast("KOL added successfully");
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-base font-semibold text-gray-900">KOL / Seeder Profiles</h3>
          <p className="text-xs text-gray-400 mt-0.5">{kols.length} profile{kols.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={clientSheetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 border border-indigo-200 rounded-lg px-3 py-1.5"
          >
            View Google Sheet ↗
          </a>
          <Button size="sm" onClick={() => setShowAdd(true)}>+ Add KOL</Button>
        </div>
      </div>

      {kols.length === 0 ? (
        <EmptyState
          title="No profiles yet"
          description="Add KOL profiles that match the campaign requirements."
          action={<Button size="sm" onClick={() => setShowAdd(true)}>+ Add First KOL</Button>}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-8">No.</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">TikTok</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Followers</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Interest (Client)</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Interest (KOL)</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Internal Remark (G)</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">KOL Queries (H)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {kols.map((kol) => (
                <tr key={kol.rowIndex} className={`hover:bg-gray-50 ${saving === kol.rowIndex ? "opacity-60" : ""}`}>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{kol.no}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{kol.name}</td>
                  <td className="px-4 py-2.5">
                    {kol.profileLink ? (
                      <a href={kol.profileLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs">
                        @{kol.profileLink.split("@")[1]?.split("?")[0] || "view"}
                      </a>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 text-xs">
                    {kol.followers ? Number(kol.followers).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <InterestSelect
                      value={kol.interestCheckClient}
                      onChange={(v) => handleInterestChange(kol, "interestCheckClient", v)}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <InterestSelect
                      value={kol.interestCheckKol}
                      onChange={(v) => handleInterestChange(kol, "interestCheckKol", v)}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 text-xs max-w-[160px] truncate">{kol.ytRemarks || "—"}</td>
                  <td className="px-4 py-2.5 text-gray-600 text-xs max-w-[160px] truncate">{kol.clientRemarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <Modal title="Add KOL Profile" onClose={() => setShowAdd(false)} size="md">
          <KolForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}
    </div>
  );
}
