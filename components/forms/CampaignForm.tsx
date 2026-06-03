"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Campaign } from "@/lib/types";
import { createCampaign, updateCampaign } from "@/lib/api";
import { FormField } from "./FormField";
import { SelectField } from "./SelectField";
import { TextareaField } from "./TextareaField";
import { Button } from "@/components/ui/Button";
import { STAGE_OPTIONS, STATUS_OPTIONS, URGENCY_OPTIONS } from "@/lib/constants";

type FormData = Omit<Campaign, "rowIndex">;

interface CampaignFormProps {
  initial?: Campaign;
  mode: "create" | "edit";
  onSuccess?: () => void;
}

const empty: FormData = {
  pic: "", picSupport: "", urgent: "", revenueSize: "", dateRequest: "",
  bdName: "", agencyName: "", campaignName: "", stage: "", clientWebsite: "",
  platformDetails: "", kolRequirement: "", budget: "", timeline: "", category: "",
  clientSheetLink: "", ytUniqueLink: "", ytAdminLink: "",
  internalSheet: "", copywriting: "", zynnApproval: "", telegramPosted: "",
  emailBlasted: "", fbGroupPosted: "", ytAdminContact: "", googleResearch: "", heepsyContact: "",
  status: "Request Assign", specialRemarks: "", totalPax: "", statusUpdatedAt: "", filledPax: "0",
};

export function CampaignForm({ initial, mode, onSuccess }: CampaignFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initial ? { ...initial } : empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.campaignName.trim()) { setError("Campaign name is required"); return; }
    setLoading(true);
    setError(null);
    try {
      if (mode === "create") {
        const { rowIndex } = await createCampaign(form);
        router.push(`/campaigns/${rowIndex}`);
      } else if (initial) {
        await updateCampaign(initial.rowIndex, form);
        onSuccess ? onSuccess() : router.push(`/campaigns/${initial.rowIndex}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Section 1: Campaign Request (BD fills) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
          Campaign Request
          <span className="ml-2 text-xs font-normal text-gray-400">Filled by BD team</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="PIC (Intern)" value={form.pic} onChange={set("pic")} placeholder="Type intern name" />
          <FormField label="PIC Support" value={form.picSupport} onChange={set("picSupport")} placeholder="Supporting intern" />
          <SelectField
            label="Urgency" value={form.urgent} onChange={set("urgent")}
            options={URGENCY_OPTIONS.map((u) => ({ value: u, label: u }))}
            placeholder="— Select —"
          />
          <FormField label="Revenue / Budget Size" value={form.revenueSize} onChange={set("revenueSize")} placeholder="e.g. RM 1,000 – RM 3,000" />
          <FormField label="Date Requested" type="date" value={form.dateRequest} onChange={set("dateRequest")} />
          <FormField label="BD Name" value={form.bdName} onChange={set("bdName")} placeholder="Type BD name" />
          <FormField label="Agency Name" value={form.agencyName} onChange={set("agencyName")} placeholder="e.g. Rose Attractions – Zaim" />
          <FormField label="Campaign / Brand Name" required value={form.campaignName} onChange={set("campaignName")} placeholder="e.g. UGC Perfume" />
          <SelectField
            label="Stage" value={form.stage} onChange={set("stage")}
            options={STAGE_OPTIONS.map((s) => ({ value: s, label: s }))}
            placeholder="— Select stage —"
          />
          <SelectField
            label="Status (Pipeline)" value={form.status} onChange={set("status")}
            options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
            placeholder="— Select status —"
          />
          <FormField label="Total Pax Required" type="number" value={form.totalPax} onChange={set("totalPax")} placeholder="e.g. 10" />
          <FormField label="Client Website / Reference" value={form.clientWebsite} onChange={set("clientWebsite")} placeholder="https://..." />
          <FormField label="Budget for Negotiation" value={form.budget} onChange={set("budget")} placeholder="e.g. RM 50 + product" />
          <FormField label="Timeline / Deadline" value={form.timeline} onChange={set("timeline")} placeholder="e.g. June 2026 / ASAP" />
          <FormField label="Category" value={form.category} onChange={set("category")} placeholder="e.g. Beauty, F&B" className="md:col-span-2" />
          <TextareaField
            label="Platform & Deliverables" value={form.platformDetails} onChange={set("platformDetails")}
            placeholder={"Platform: TikTok\nFollowers: 1,000–5,000\nNo of pax: 10\nDeliverables: TT Video Content"}
            rows={4} className="md:col-span-2"
          />
          <TextareaField
            label="KOL / Seeder Requirements" value={form.kolRequirement} onChange={set("kolRequirement")}
            placeholder={"Gender: Female\nRace: Malay, Chinese\nAge: Any\nLocation: Malaysia"}
            rows={4} className="md:col-span-2"
          />
        </div>
      </div>

      {/* Section 2: Research Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
          Research Progress
          <span className="ml-2 text-xs font-normal text-gray-400">Filled by research team</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="YT Unique Link (Invite)" value={form.ytUniqueLink} onChange={set("ytUniqueLink")} placeholder="https://..." />
          <FormField label="YT Admin Link" value={form.ytAdminLink} onChange={set("ytAdminLink")} placeholder="https://..." />
          <FormField label="Internal Sheet" value={form.internalSheet} onChange={set("internalSheet")} placeholder="Reference link or note" />
          <FormField label="Zynn Approval / Quality Check" value={form.zynnApproval} onChange={set("zynnApproval")} placeholder="Approved / Pending / Rejected" />
          <SelectField
            label="Telegram Posted?" value={form.telegramPosted} onChange={set("telegramPosted")}
            options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]}
            placeholder="— Select —"
          />
          <SelectField
            label="Email Blasted?" value={form.emailBlasted} onChange={set("emailBlasted")}
            options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]}
            placeholder="— Select —"
          />
          <SelectField
            label="FB Group Posted?" value={form.fbGroupPosted} onChange={set("fbGroupPosted")}
            options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]}
            placeholder="— Select —"
          />
          <FormField label="YT Admin Contact (Numbers)" value={form.ytAdminContact} onChange={set("ytAdminContact")} placeholder="Phone / Telegram numbers" />
          <FormField label="Heepsy Contact" value={form.heepsyContact} onChange={set("heepsyContact")} className="md:col-span-2" />
          <TextareaField
            label="Copywriting / Outreach Approach" value={form.copywriting} onChange={set("copywriting")}
            placeholder={"Hi 😊\n\nI'm [Name] from YouthsToday. I'd like to check if you might be interested in joining our campaign..."}
            rows={5} className="md:col-span-2"
          />
          <TextareaField
            label="Google Research Notes" value={form.googleResearch} onChange={set("googleResearch")}
            rows={3} className="md:col-span-2"
          />
          <TextareaField
            label="Special Remarks (BD ↔ Research)" value={form.specialRemarks} onChange={set("specialRemarks")}
            placeholder="Notes between BD and research team"
            rows={3} className="md:col-span-2"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {mode === "create" ? "Create Campaign" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
